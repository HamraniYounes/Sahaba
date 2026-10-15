/*
  Rôle OWNER (propriétaire) + correctifs de sécurité / intégrité.

  Fonctionnement :
    - Un compte USER devient OWNER (inscription « propriétaire », bouton dans le profil → RPC become_owner(),
      ou changement manuel par un admin).
    - Seuls OWNER / MODERATOR / ADMIN peuvent réclamer un lieu (table claims).
    - Après approbation par un modérateur (RPC approve_claim), owner_id est renseigné : c'est alors – et seulement alors –
      que le propriétaire peut modifier la fiche et répondre aux avis.
    - Le créateur d'une proposition ne peut modifier sa fiche que tant qu'elle est en attente / refusée et sans propriétaire.

  Le fichier peut être rejoué sans risque.
*/

-- ───────── Rôle OWNER ─────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('USER','OWNER','MODERATOR','ADMIN'));

create or replace function public.can_claim()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('OWNER','MODERATOR','ADMIN'), false)
$$;

-- profil créé à l'inscription : rôle OWNER si le compte a été créé comme « propriétaire »
-- (rôle sans privilège de publication : toute réclamation reste validée par la modération)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email,
          coalesce(nullif(new.raw_user_meta_data->>'name',''), nullif(new.raw_user_meta_data->>'full_name',''), ''),
          case when new.raw_user_meta_data->>'account_type' = 'owner' then 'OWNER' else 'USER' end)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- un utilisateur ne change pas son propre rôle (sauf via nos fonctions internes qui posent le drapeau)
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and coalesce(current_setting('sahaba.bypass', true), '') <> 'on'
     and not public.is_admin() then
    new.role := old.role;
  end if;
  new.email := old.email;
  return new;
end;
$$;

-- USER → OWNER pour soi-même (jamais l'inverse, jamais vers MODERATOR/ADMIN)
create or replace function public.become_owner()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform set_config('sahaba.bypass', 'on', true);
  update public.profiles set role = 'OWNER' where id = auth.uid() and role = 'USER';
  perform set_config('sahaba.bypass', 'off', true);
end;
$$;
revoke all on function public.become_owner() from public, anon;
grant execute on function public.become_owner() to authenticated;

-- ───────── Réclamations ─────────
-- doublons éventuels : on garde la plus récente demande en attente par (lieu, demandeur)
update public.claims c set status = 'rejected', admin_note = coalesce(admin_note, 'Doublon')
where status = 'pending' and exists (
  select 1 from public.claims d
  where d.location_id = c.location_id and d.user_id = c.user_id and d.status = 'pending'
    and (d.created_at, d.id) > (c.created_at, c.id));
create unique index if not exists claims_one_pending_per_user on public.claims(location_id, user_id) where status = 'pending';

drop policy if exists "claims creation" on public.claims;
create policy "claims creation" on public.claims for insert to authenticated
  with check (
    user_id = auth.uid() and status = 'pending' and public.can_claim()
    and exists (select 1 from public.locations l
                where l.id = location_id and l.status in ('PUBLISHED','CLAIMED') and l.owner_id is distinct from auth.uid())
  );

create or replace function public.approve_claim(claim uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c public.claims; loc public.locations;
begin
  if not public.is_moderator() then raise exception 'Réservé aux modérateurs'; end if;
  select * into c from public.claims where id = claim for update;
  if not found then raise exception 'Réclamation introuvable'; end if;
  if c.status <> 'pending' then raise exception 'Cette réclamation a déjà été traitée'; end if;
  select * into loc from public.locations where id = c.location_id for update;
  if not found or loc.status not in ('PUBLISHED','CLAIMED') then raise exception 'Le lieu doit être publié pour être réclamé'; end if;

  -- le demandeur devient OWNER s'il ne l'était pas encore (on ne rétrograde jamais un modérateur / admin)
  perform set_config('sahaba.bypass', 'on', true);
  update public.profiles set role = 'OWNER' where id = c.user_id and role = 'USER';
  perform set_config('sahaba.bypass', 'off', true);

  update public.locations set owner_id = c.user_id, status = 'CLAIMED' where id = c.location_id;
  update public.claims set status = 'approved' where id = claim;
  update public.claims set status = 'rejected', admin_note = coalesce(admin_note, 'Une autre réclamation a été acceptée')
    where location_id = c.location_id and status = 'pending' and id <> claim;
end;
$$;
revoke all on function public.approve_claim(uuid) from public, anon;
grant execute on function public.approve_claim(uuid) to authenticated;

-- ───────── Droits de modification des lieux ─────────
-- propriétaire approuvé ou modérateur ; le créateur seulement tant que la fiche n'est ni publiée ni réclamée
drop policy if exists "locations maj" on public.locations;
create policy "locations maj" on public.locations for update to authenticated
  using (
    public.is_moderator() or owner_id = auth.uid()
    or (created_by = auth.uid() and owner_id is null and status in ('PENDING','REJECTED'))
  )
  with check (
    public.is_moderator() or owner_id = auth.uid()
    or (created_by = auth.uid() and owner_id is null and status in ('PENDING','REJECTED'))
  );
drop policy if exists "locations suppression" on public.locations;
create policy "locations suppression" on public.locations for delete to authenticated
  using (public.is_moderator() or (created_by = auth.uid() and owner_id is null and status in ('PENDING','REJECTED')));

-- cohérence statut / propriétaire : propriétaire présent ⇒ CLAIMED, absent ⇒ PUBLISHED
create or replace function public.sync_location_status()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.owner_id is not null and new.status = 'PUBLISHED' then new.status := 'CLAIMED';
  elsif new.owner_id is null and new.status = 'CLAIMED' then new.status := 'PUBLISHED';
  end if;
  return new;
end;
$$;
drop trigger if exists locations_status_sync on public.locations;
create trigger locations_status_sync before insert or update on public.locations
  for each row execute function public.sync_location_status();
-- (le nom commence par « s » : il s'exécute après locations_protect, qui a déjà restauré les champs interdits)

select set_config('sahaba.bypass', 'on', true);
update public.locations set status = 'CLAIMED'   where owner_id is not null and status = 'PUBLISHED';
update public.locations set status = 'PUBLISHED' where owner_id is null     and status = 'CLAIMED';
select set_config('sahaba.bypass', 'off', true);

-- ───────── Avis & réponses ─────────
-- on ne note que les lieux publiés, et pas son propre établissement
drop policy if exists "reviews creation" on public.reviews;
create policy "reviews creation" on public.reviews for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from public.locations l
              where l.id = location_id and l.status in ('PUBLISHED','CLAIMED') and l.owner_id is distinct from auth.uid())
);

-- la réponse doit viser un avis du même lieu (sinon un propriétaire pouvait « squatter » l'avis d'un autre lieu)
drop policy if exists "replies creation" on public.owner_replies;
create policy "replies creation" on public.owner_replies for insert to authenticated with check (
  owner_id = auth.uid()
  and exists (select 1 from public.locations l where l.id = location_id and l.owner_id = auth.uid())
  and exists (select 1 from public.reviews r where r.id = review_id and r.location_id = owner_replies.location_id)
);

-- ───────── Suppression de compte ─────────
-- Avant : le trigger protect_location_fields annulait le « set null » des clés étrangères (created_by / owner_id)
-- pour un non-modérateur : le compte était supprimé mais les lieux gardaient une référence vers un utilisateur
-- inexistant (et un lieu « réclamé » gardait un propriétaire fantôme).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Non connecté'; end if;
  perform set_config('sahaba.bypass', 'on', true);
  update public.locations set owner_id = null where owner_id = uid;       -- sync_location_status repasse CLAIMED → PUBLISHED
  update public.locations set created_by = null where created_by = uid;
  perform set_config('sahaba.bypass', 'off', true);
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
