/*
  Schéma Sahaba (remplace base44) — version complète
  Tables : profiles, categories, locations, reviews, owner_replies, favorites,
           reports, claims, moderation_sessions, ads, contact_messages
  + RLS, triggers, fonctions RPC, buckets Storage
*/

-- ───────── Tables ─────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  name        text not null default '',
  avatar_url  text,
  role        text not null default 'USER' check (role in ('USER','MODERATOR','ADMIN')),
  created_at  timestamptz not null default now()
);
-- la migration précédente pouvait avoir créé profiles sans ces colonnes
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists name text not null default '';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create table if not exists public.categories (
  id    text primary key,
  name  text not null,
  icon  text not null default 'map-pin',
  sort  integer not null default 0
);

create table if not exists public.locations (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  category_id     text not null references public.categories(id),
  address         text not null,
  city            text not null,
  postal_code     text,
  country         text not null default 'Belgique',
  latitude        double precision,              -- nullable : lieux importés à géocoder
  longitude       double precision,
  phone           text,
  email           text,
  website         text,
  description     text,
  photo_url       text,
  photos          text[] not null default '{}',
  opening_hours   jsonb,                         -- { mon:[{open:"11:30",close:"22:00"}], ... }
  price_range     smallint check (price_range between 1 and 4),
  metadata        jsonb not null default '{}'::jsonb,
  status          text not null default 'PENDING' check (status in ('PENDING','PUBLISHED','REJECTED','CLAIMED')),
  flagged         boolean not null default false,
  moderation_note text,
  verified        boolean not null default false,
  owner_id        uuid references auth.users(id) on delete set null,
  created_by      uuid references auth.users(id) on delete set null,
  rating_avg      numeric(3,2) not null default 0,
  review_count    integer not null default 0,
  view_count      integer not null default 0,
  favorite_count  integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists locations_city_idx     on public.locations(city);
create index if not exists locations_status_idx   on public.locations(status);
create index if not exists locations_category_idx on public.locations(category_id);
create index if not exists locations_owner_idx    on public.locations(owner_id);
create index if not exists locations_creator_idx  on public.locations(created_by);

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  rating       smallint not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (location_id, user_id)
);

create table if not exists public.owner_replies (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null unique references public.reviews(id) on delete cascade,
  location_id  uuid not null references public.locations(id) on delete cascade,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  hidden       boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id      uuid not null references auth.users(id) on delete cascade,
  location_id  uuid not null references public.locations(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, location_id)
);

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  reporter_id  uuid references auth.users(id) on delete set null,
  reason       text not null check (reason in ('obsolete','incorrect','inappropriate','closed','other')),
  comment      text,
  status       text not null default 'pending' check (status in ('pending','resolved','dismissed')),
  created_at   timestamptz not null default now()
);
create index if not exists reports_location_idx on public.reports(location_id);

create table if not exists public.claims (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  message      text,
  documents    text[] not null default '{}',     -- chemins dans le bucket privé claim-documents
  is_transfer  boolean not null default false,   -- transfert d'un propriétaire existant
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note   text,
  created_at   timestamptz not null default now()
);

create table if not exists public.moderation_sessions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date not null,
  time        time,
  note        text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.ads (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  cta          text,
  url          text,
  image_url    text,
  placement    text not null default 'both' check (placement in ('home','detail','both')),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ───────── Fonctions utilitaires ─────────
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('MODERATOR','ADMIN'), false)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'ADMIN', false)
$$;

-- profil créé automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email,
          coalesce(nullif(new.raw_user_meta_data->>'name',''), nullif(new.raw_user_meta_data->>'full_name',''), ''),
          'USER')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- un utilisateur ne peut pas changer son propre rôle
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  new.email := old.email;
  return new;
end;
$$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- vue publique (nom + avatar uniquement, jamais l'email)
create or replace view public.public_profiles as
  select id, name, avatar_url from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- note moyenne
create or replace function public.refresh_location_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare lid uuid := coalesce(new.location_id, old.location_id);
begin
  perform set_config('sahaba.bypass', 'on', true);
  update public.locations l set
    rating_avg   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where location_id = lid), 0),
    review_count = (select count(*) from public.reviews where location_id = lid)
  where l.id = lid;
  perform set_config('sahaba.bypass', 'off', true);
  return null;
end;
$$;
drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_location_rating();

-- compteur de favoris
create or replace function public.refresh_favorite_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare lid uuid := coalesce(new.location_id, old.location_id);
begin
  perform set_config('sahaba.bypass', 'on', true);
  update public.locations set favorite_count = (select count(*) from public.favorites where location_id = lid) where id = lid;
  perform set_config('sahaba.bypass', 'off', true);
  return null;
end;
$$;
drop trigger if exists favorites_refresh_count on public.favorites;
create trigger favorites_refresh_count
  after insert or delete on public.favorites
  for each row execute function public.refresh_favorite_count();

-- 3 signalements en attente = lieu signalé
create or replace function public.flag_on_reports()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reports where location_id = new.location_id and status = 'pending') >= 3 then
    perform set_config('sahaba.bypass', 'on', true);
    update public.locations set flagged = true where id = new.location_id;
    perform set_config('sahaba.bypass', 'off', true);
  end if;
  return null;
end;
$$;
drop trigger if exists reports_flag on public.reports;
create trigger reports_flag after insert on public.reports
  for each row execute function public.flag_on_reports();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists locations_touch on public.locations;
create trigger locations_touch before update on public.locations
  for each row execute function public.touch_updated_at();

-- les non-modérateurs ne peuvent pas toucher aux champs de modération / compteurs
create or replace function public.protect_location_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- mises à jour internes (compteurs, signalements, vues) : drapeau posé par nos fonctions
  if coalesce(current_setting('sahaba.bypass', true), '') = 'on' then
    return new;
  end if;
  if auth.uid() is not null and not public.is_moderator() then
    new.status          := old.status;
    new.flagged         := old.flagged;
    new.moderation_note := old.moderation_note;
    new.verified        := old.verified;
    new.owner_id        := old.owner_id;
    new.created_by      := old.created_by;
    new.rating_avg      := old.rating_avg;
    new.review_count    := old.review_count;
    new.view_count      := old.view_count;
    new.favorite_count  := old.favorite_count;
  end if;
  return new;
end;
$$;
drop trigger if exists locations_protect on public.locations;
create trigger locations_protect before update on public.locations
  for each row execute function public.protect_location_fields();

create or replace function public.protect_reply_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_moderator() then
    new.hidden := old.hidden; new.review_id := old.review_id;
    new.location_id := old.location_id; new.owner_id := old.owner_id;
  end if;
  return new;
end;
$$;
drop trigger if exists replies_protect on public.owner_replies;
create trigger replies_protect before update on public.owner_replies
  for each row execute function public.protect_reply_fields();

-- ───────── RPC ─────────
create or replace function public.increment_view(loc uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('sahaba.bypass', 'on', true);
  update public.locations set view_count = view_count + 1
  where id = loc and status in ('PUBLISHED','CLAIMED');
  perform set_config('sahaba.bypass', 'off', true);
end;
$$;
grant execute on function public.increment_view(uuid) to anon, authenticated;

create or replace function public.approve_claim(claim uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c public.claims;
begin
  if not public.is_moderator() then raise exception 'Réservé aux modérateurs'; end if;
  select * into c from public.claims where id = claim;
  if not found then raise exception 'Réclamation introuvable'; end if;
  update public.locations set owner_id = c.user_id, status = 'CLAIMED' where id = c.location_id;
  update public.claims set status = 'approved' where id = claim;
  update public.claims set status = 'rejected', admin_note = coalesce(admin_note, 'Une autre réclamation a été acceptée')
    where location_id = c.location_id and status = 'pending' and id <> claim;
end;
$$;
grant execute on function public.approve_claim(uuid) to authenticated;

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
grant execute on function public.delete_my_account() to authenticated;

-- ───────── RLS ─────────
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.locations           enable row level security;
alter table public.reviews             enable row level security;
alter table public.owner_replies       enable row level security;
alter table public.favorites           enable row level security;
alter table public.reports             enable row level security;
alter table public.claims              enable row level security;
alter table public.moderation_sessions enable row level security;
alter table public.ads                 enable row level security;
alter table public.contact_messages    enable row level security;

-- profiles : soi-même ou modérateur (les noms publics passent par public_profiles)
drop policy if exists "profiles lecture" on public.profiles;
drop policy if exists "profiles lecture perso" on public.profiles;
create policy "profiles lecture perso" on public.profiles for select using (auth.uid() = id or public.is_moderator());
drop policy if exists "profiles maj perso" on public.profiles;
create policy "profiles maj perso" on public.profiles for update
  using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

-- categories
drop policy if exists "categories lecture" on public.categories;
create policy "categories lecture" on public.categories for select using (true);

-- locations
drop policy if exists "locations lecture" on public.locations;
create policy "locations lecture" on public.locations for select using (
  status in ('PUBLISHED','CLAIMED') or created_by = auth.uid() or owner_id = auth.uid() or public.is_moderator()
);
drop policy if exists "locations proposition" on public.locations;
create policy "locations proposition" on public.locations for insert to authenticated
  with check (created_by = auth.uid() and status = 'PENDING' and verified = false and owner_id is null
              and rating_avg = 0 and review_count = 0 and view_count = 0 and favorite_count = 0 and flagged = false);
drop policy if exists "locations maj" on public.locations;
create policy "locations maj" on public.locations for update to authenticated
  using (created_by = auth.uid() or owner_id = auth.uid() or public.is_moderator())
  with check (created_by = auth.uid() or owner_id = auth.uid() or public.is_moderator());
drop policy if exists "locations suppression" on public.locations;
create policy "locations suppression" on public.locations for delete to authenticated
  using (created_by = auth.uid() or owner_id = auth.uid() or public.is_moderator());

-- reviews
drop policy if exists "reviews lecture" on public.reviews;
create policy "reviews lecture" on public.reviews for select using (true);
drop policy if exists "reviews creation" on public.reviews;
create policy "reviews creation" on public.reviews for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "reviews maj" on public.reviews;
create policy "reviews maj" on public.reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "reviews suppression" on public.reviews;
create policy "reviews suppression" on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_moderator());

-- owner_replies
drop policy if exists "replies lecture" on public.owner_replies;
create policy "replies lecture" on public.owner_replies for select using (
  hidden = false or owner_id = auth.uid() or public.is_moderator()
);
drop policy if exists "replies creation" on public.owner_replies;
create policy "replies creation" on public.owner_replies for insert to authenticated with check (
  owner_id = auth.uid()
  and exists (select 1 from public.locations l where l.id = location_id and l.owner_id = auth.uid())
);
drop policy if exists "replies maj" on public.owner_replies;
create policy "replies maj" on public.owner_replies for update to authenticated
  using (owner_id = auth.uid() or public.is_moderator()) with check (owner_id = auth.uid() or public.is_moderator());
drop policy if exists "replies suppression" on public.owner_replies;
create policy "replies suppression" on public.owner_replies for delete to authenticated
  using (owner_id = auth.uid() or public.is_moderator());

-- favorites
drop policy if exists "favorites lecture perso" on public.favorites;
create policy "favorites lecture perso" on public.favorites for select to authenticated using (user_id = auth.uid());
drop policy if exists "favorites ajout" on public.favorites;
create policy "favorites ajout" on public.favorites for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "favorites suppression" on public.favorites;
create policy "favorites suppression" on public.favorites for delete to authenticated using (user_id = auth.uid());

-- reports : création publique, lecture/traitement modérateurs
drop policy if exists "reports creation" on public.reports;
create policy "reports creation" on public.reports for insert to anon, authenticated
  with check (status = 'pending' and (reporter_id is null or reporter_id = auth.uid()));
drop policy if exists "reports lecture" on public.reports;
create policy "reports lecture" on public.reports for select to authenticated using (public.is_moderator());
drop policy if exists "reports maj" on public.reports;
create policy "reports maj" on public.reports for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());
drop policy if exists "reports suppression" on public.reports;
create policy "reports suppression" on public.reports for delete to authenticated using (public.is_moderator());

-- claims
drop policy if exists "claims creation" on public.claims;
create policy "claims creation" on public.claims for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
drop policy if exists "claims lecture" on public.claims;
create policy "claims lecture" on public.claims for select to authenticated
  using (user_id = auth.uid() or public.is_moderator());
drop policy if exists "claims maj" on public.claims;
create policy "claims maj" on public.claims for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

-- moderation_sessions
drop policy if exists "sessions moderateurs" on public.moderation_sessions;
create policy "sessions moderateurs" on public.moderation_sessions for all to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

-- ads : lecture publique des actives, gestion admin
drop policy if exists "ads lecture" on public.ads;
create policy "ads lecture" on public.ads for select using (active = true or public.is_moderator());
drop policy if exists "ads admin" on public.ads;
create policy "ads admin" on public.ads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- contact_messages
drop policy if exists "contact creation" on public.contact_messages;
create policy "contact creation" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "contact lecture" on public.contact_messages;
create policy "contact lecture" on public.contact_messages for select to authenticated using (public.is_moderator());
drop policy if exists "contact suppression" on public.contact_messages;
create policy "contact suppression" on public.contact_messages for delete to authenticated using (public.is_moderator());

-- ───────── Storage ─────────
insert into storage.buckets (id, name, public) values ('location-photos','location-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('claim-documents','claim-documents', false)
  on conflict (id) do nothing;

-- photos : lecture publique, écriture dans son propre dossier <uid>/...
drop policy if exists "photos lecture" on storage.objects;
create policy "photos lecture" on storage.objects for select using (bucket_id = 'location-photos');
drop policy if exists "photos ajout" on storage.objects;
create policy "photos ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'location-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos suppression" on storage.objects;
create policy "photos suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'location-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_moderator()));

-- justificatifs : privés (auteur + modérateurs)
drop policy if exists "claimdocs ajout" on storage.objects;
create policy "claimdocs ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'claim-documents' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "claimdocs lecture" on storage.objects;
create policy "claimdocs lecture" on storage.objects for select to authenticated
  using (bucket_id = 'claim-documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_moderator()));

-- ───────── Données initiales ─────────
insert into public.categories (id, name, icon, sort) values
  ('restaurant','Restaurant','utensils',1),
  ('fast_food','Fast-food','sandwich',2),
  ('cafe','Café / Salon de thé','coffee',3),
  ('boulangerie','Boulangerie','croissant',4),
  ('patisserie','Pâtisserie','cake',5),
  ('boucherie','Boucherie','beef',6),
  ('epicerie','Épicerie','shopping-basket',7),
  ('supermarche','Supermarché','store',8),
  ('traiteur','Traiteur','chef-hat',9),
  ('mosquee','Mosquée','landmark',10),
  ('salle_priere','Salle de prière','moon',11),
  ('ecole_coran','École coranique','book-open',12),
  ('centre_islamique','Centre islamique','building',13),
  ('association','Association','users',14),
  ('funeraire','Services funéraires','flower',15),
  ('sante','Santé','stethoscope',16),
  ('pharmacie','Pharmacie','pill',17),
  ('hotel','Hôtel','bed',18),
  ('hebergement','Hébergement / Gîte','home',19),
  ('piscine','Piscine','waves',20),
  ('salle_sport','Salle de sport','dumbbell',21),
  ('coiffeur','Coiffeur / Beauté','scissors',22),
  ('vetements','Vêtements','shirt',23),
  ('librairie','Librairie','book',24),
  ('banque_islamique','Finance islamique','landmark',25),
  ('salle_fetes','Salle de fêtes','party-popper',26),
  ('agence_voyage','Agence de voyage (Omra/Hajj)','plane',27)
on conflict (id) do nothing;

insert into public.locations
  (slug, name, category_id, address, city, postal_code, phone, website, description,
   latitude, longitude, opening_hours, price_range, metadata, status, verified)
values
  ('restaurant-al-mounia-bruxelles','Restaurant Al Mounia','restaurant','42 Rue de la Paix','Bruxelles','1000','+32 2 123 45 67','https://almounia.be',
   'Cuisine marocaine authentique : tajines, couscous, pastilla.',50.8503,4.3517,
   '{"mon":[{"open":"11:30","close":"22:00"}],"tue":[{"open":"11:30","close":"22:00"}],"wed":[{"open":"11:30","close":"22:00"}],"thu":[{"open":"11:30","close":"22:00"}],"fri":[{"open":"11:30","close":"23:00"}],"sat":[{"open":"11:30","close":"23:00"}],"sun":[]}',
   2,'{"halal_full":true,"alcohol_free":true,"prayer_room":true,"vegetarian_options":true}','PUBLISHED',true),
  ('boucherie-medina-bruxelles','Boucherie Medina','boucherie','45 Rue de Brabant','Bruxelles','1030','+32 2 234 56 78',null,
   'Boucherie halal, viande fraîche certifiée.',50.8561,4.3631,
   '{"mon":[],"tue":[{"open":"08:00","close":"19:00"}],"wed":[{"open":"08:00","close":"19:00"}],"thu":[{"open":"08:00","close":"19:00"}],"fri":[{"open":"08:00","close":"19:00"}],"sat":[{"open":"08:00","close":"19:00"}],"sun":[{"open":"08:00","close":"13:00"}]}',
   2,'{"halal_full":true,"parking":true}','PUBLISHED',true),
  ('piscine-amina-bruxelles','Piscine Amina (Femmes)','piscine','78 Boulevard Anspach','Bruxelles','1000',null,null,
   'Créneaux réservés aux femmes.',50.8486,4.3500,null,
   2,'{"women_only":true,"burkini_friendly":true,"accessible":true}','PUBLISHED',true),
  ('mosquee-al-ghassani-bruxelles','Mosquée Al Ghassani','mosquee','12 Rue du Béguinage','Bruxelles','1000',null,null,
   'Lieu de prière ouvert à tous.',50.8532,4.3552,null,
   null,'{"prayer_room":true,"wudu_facilities":true,"accessible":true}','PUBLISHED',true)
on conflict (slug) do nothing;
