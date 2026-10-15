# Sahaba

Annuaire communautaire des lieux halal et musulmans d'Europe (27 catégories : restaurants, mosquées, écoles coraniques,
services funéraires, santé, commerces…). Interface en 33 langues (Google Translate), mode sombre, mobile et desktop.

React 18 + Vite + TypeScript + Tailwind · **Supabase** (Postgres, Auth, Storage, RLS) · Leaflet (tuiles CARTO Voyager) · Recharts.
Aucune dépendance à base44.

## Mise en route

1. Créez un projet sur https://supabase.com.
2. **SQL Editor** : exécutez dans l'ordre `20260601000000_sahaba_schema.sql` puis `20260602000000_owner_role.sql`
   (ou `supabase db push`).
   Le fichier peut être rejoué sans risque : il crée les tables, la sécurité par ligne (RLS), les fonctions, les deux
   buckets de stockage (`location-photos` public, `claim-documents` privé), les 27 catégories et 4 lieux d'exemple.
3. `cp .env.example .env`, puis renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
4. **Authentication → URL Configuration** : *Site URL* = votre URL (ex. `http://localhost:5173`) et ajoutez
   `…/reset-password` aux *Redirect URLs*.
5. `npm install && npm run dev`

### Inscription par code (OTP)

L'inscription demande un code à 6 chiffres reçu par email. Dans **Authentication → Email Templates → Confirm signup**,
ajoutez `{{ .Token }}` au message (par exemple : « Votre code : {{ .Token }} »). Le lien de confirmation reste utilisable.

### Connexion Google

**Authentication → Providers → Google** : renseignez le Client ID / Secret créés dans Google Cloud Console, avec l'URL de
callback indiquée par Supabase. Sans cela, le bouton Google affichera une erreur ; la connexion par email fonctionne seule.

### Devenir administrateur

Après votre inscription, dans le SQL Editor :

```sql
update public.profiles set role = 'ADMIN'
where id = (select id from auth.users where email = 'vous@exemple.com');
```

Rôles : `USER`, `OWNER` (propriétaire : peut réclamer un lieu), `MODERATOR` (modération, signalements, réclamations),
`ADMIN` (en plus : utilisateurs et publicité). L'admin peut ensuite changer les rôles dans `/admin/users`.

### Rôle propriétaire (OWNER)

1. Le compte devient `OWNER` à l'inscription (case « Je suis propriétaire ») ou via le bouton « Je gère un établissement »
   du profil (fonction `become_owner()`).
2. Un `OWNER` dépose une réclamation sur la fiche d'un lieu publié, avec justificatifs privés.
3. Un modérateur l'approuve dans `/admin/claims` : le lieu passe `CLAIMED`, et **seulement alors** le propriétaire peut
   modifier la fiche et répondre aux avis (appliqué par RLS, pas seulement dans l'interface).
4. Le créateur d'une proposition ne peut la modifier que tant qu'elle est en attente ou refusée et sans propriétaire.

## Fonctionnalités

- **Découverte** : recherche texte, géolocalisation avec rayon 1–100 km, filtres (catégorie, caractéristiques, ouvert
  maintenant, gamme de prix), tri, vue grille / carte, statut Ouvert/Fermé (créneaux après minuit gérés), pull-to-refresh.
- **Fiche** `/location/:slug` : galerie + lightbox, horaires, carte et itinéraire, avis, réponses du propriétaire,
  favoris, partage, signalement, réclamation de propriété (justificatifs privés), édition par le propriétaire.
- **Contribution** `/submit` : multi-photos, géocodage automatique (Nominatim), modération avant publication.
- **Compte** : `/favorites`, `/profile` (badges de contribution, avis, espace propriétaire, suppression du compte).
- **Administration** `/admin` : tableau de bord (géocodage en masse), modération, gestion des lieux, signalements
  (3 signalements en attente = lieu signalé), réclamations (transferts inclus), publicité, utilisateurs, statistiques.

## Sécurité

Tout est appliqué dans la base (RLS), pas seulement dans l'interface : seul un modérateur publie un lieu ; un utilisateur
ne peut ni changer son rôle, ni toucher aux notes, compteurs ou statuts ; les emails ne sont jamais exposés
publiquement (vue `public_profiles` limitée au nom et à l'avatar) ; les justificatifs de réclamation ne sont lisibles que
par leur auteur et les modérateurs. La clé `anon` est publique par conception ; ne mettez jamais la clé `service_role`
dans le front.

## Publicité (AdSense)

Les annonces maison se gèrent dans `/admin/ads`. Pour Google AdSense, ajoutez le script fourni par Google dans `index.html`.

## Déploiement

`npm run build` produit `dist/` (statique). Netlify (`public/_redirects`) et Vercel (`vercel.json`) gèrent le routage SPA.
Pensez à ajouter votre domaine de production dans les URL autorisées de Supabase.

## Importer des données existantes

Exportez vos lieux depuis base44 (CSV/JSON) et importez-les dans `public.locations` (champs `latitude`/`longitude` peuvent
rester vides : le bouton de géocodage en masse du tableau de bord les complète).
