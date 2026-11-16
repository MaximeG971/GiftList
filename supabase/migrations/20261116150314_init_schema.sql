-- =====================================================================
-- GiftList : schéma initial (V1)
-- =====================================================================

-- ---------- Types énumérés ----------
create type public.family_role as enum ('admin', 'member');
create type public.member_status as enum ('active', 'removed');
create type public.profile_type as enum ('adult', 'child');
create type public.profile_status as enum ('active', 'inactive', 'archived');
create type public.gift_visibility as enum ('active', 'hidden');
create type public.gift_received_status as enum ('wished', 'received');
create type public.invitation_status as enum ('pending', 'used', 'revoked');

-- ---------- Fonction utilitaire : updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- families ----------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  accent_color text check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  avatar_type text not null default 'initials'
    check (avatar_type in ('initials', 'illustration', 'photo')),
  avatar_path text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- family_members ----------
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.family_role not null default 'member',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (family_id, user_id),
  unique (id, family_id)
);

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  first_name text not null check (char_length(first_name) between 1 and 60),
  avatar_path text,
  type public.profile_type not null,
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id),
  -- un profil enfant n'a jamais de compte rattaché
  check (type = 'adult' or user_id is null)
);

-- une seule fiche adulte par utilisateur et par famille
create unique index profiles_one_adult_per_user_family
  on public.profiles (family_id, user_id)
  where type = 'adult' and user_id is not null;

-- ---------- profile_managers ----------
-- Adultes autorisés à gérer la liste d'un profil (enfants ; sert aussi
-- au transfert d'un profil adulte orphelin vers un autre membre).
create table public.profile_managers (
  profile_id uuid not null,
  family_member_id uuid not null,
  family_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, family_member_id),
  foreign key (profile_id, family_id)
    references public.profiles (id, family_id) on delete cascade,
  foreign key (family_member_id, family_id)
    references public.family_members (id, family_id) on delete cascade
);

-- ---------- wishlists ----------
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique,
  family_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id),
  foreign key (profile_id, family_id)
    references public.profiles (id, family_id) on delete cascade
);

-- ---------- categories ----------
-- family_id NULL = catégorie prédéfinie globale
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  slug text not null,
  is_default boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  check (is_default = (family_id is null))
);

create unique index categories_unique_slug
  on public.categories (
    coalesce(family_id, '00000000-0000-0000-0000-000000000000'::uuid),
    slug
  );

-- ---------- gifts ----------
-- Statut de visibilité et statut d'obtention : deux champs distincts.
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null,
  family_id uuid not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  url text check (url ~* '^https?://'),
  image_path text,
  image_url text check (image_url ~* '^https?://'),
  price numeric(10, 2) check (price >= 0),
  merchant text,
  quantity integer not null default 1 check (quantity >= 1),
  size text,
  color text,
  comment text,
  visibility_status public.gift_visibility not null default 'active',
  received_status public.gift_received_status not null default 'wished',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (wishlist_id, family_id)
    references public.wishlists (id, family_id) on delete cascade
);

-- une catégorie personnalisée doit appartenir à la même famille que le cadeau
create or replace function public.check_gift_category()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  cat_family uuid;
begin
  select family_id into cat_family
  from public.categories
  where id = new.category_id;

  if cat_family is not null and cat_family <> new.family_id then
    raise exception 'La catégorie n''appartient pas à la famille du cadeau';
  end if;
  return new;
end;
$$;

create trigger gifts_check_category
  before insert or update of category_id, family_id on public.gifts
  for each row execute function public.check_gift_category();

-- ---------- invitations ----------
-- Le jeton n'est jamais stocké en clair : uniquement son empreinte.
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  token_hash text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_by uuid references auth.users (id) on delete set null,
  used_by uuid references auth.users (id) on delete set null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days')
);

-- ---------- user_preferences ----------
create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  wishlist_display_mode text not null default 'grid'
    check (wishlist_display_mode in ('grid', 'list')),
  updated_at timestamptz not null default now()
);

-- ---------- Wishlist créée automatiquement avec chaque profil ----------
create or replace function public.create_wishlist_for_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wishlists (profile_id, family_id)
  values (new.id, new.family_id);
  return new;
end;
$$;

revoke all on function public.create_wishlist_for_profile() from public, anon, authenticated;

create trigger profiles_create_wishlist
  after insert on public.profiles
  for each row execute function public.create_wishlist_for_profile();

-- ---------- Triggers updated_at ----------
create trigger families_set_updated_at before update on public.families
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger wishlists_set_updated_at before update on public.wishlists
  for each row execute function public.set_updated_at();
create trigger gifts_set_updated_at before update on public.gifts
  for each row execute function public.set_updated_at();
create trigger user_preferences_set_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ---------- Index ----------
create index family_members_user_idx on public.family_members (user_id);
create index profiles_family_idx on public.profiles (family_id);
create index profile_managers_member_idx on public.profile_managers (family_member_id);
create index categories_family_idx on public.categories (family_id);
create index gifts_wishlist_created_idx on public.gifts (wishlist_id, created_at desc);
create index gifts_family_idx on public.gifts (family_id);
create index gifts_category_idx on public.gifts (category_id);
create index invitations_family_idx on public.invitations (family_id);
create index notifications_recipient_idx
  on public.notifications (recipient_user_id, created_at desc);
create index notifications_expires_idx on public.notifications (expires_at);

-- ---------- Catégories prédéfinies (liste à confirmer avant la prod) ----------
insert into public.categories (family_id, name, slug, is_default, position) values
  (null, 'Mode & accessoires',   'mode-accessoires',   true, 1),
  (null, 'Sneakers & chaussures','sneakers-chaussures',true, 2),
  (null, 'High-tech',            'high-tech',          true, 3),
  (null, 'Maison & décoration',  'maison-decoration',  true, 4),
  (null, 'Cuisine',              'cuisine',            true, 5),
  (null, 'Beauté & soins',       'beaute-soins',       true, 6),
  (null, 'Parfum',               'parfum',             true, 7),
  (null, 'Loisirs & jeux',       'loisirs-jeux',       true, 8),
  (null, 'Sport',                'sport',              true, 9),
  (null, 'Livres & culture',     'livres-culture',     true, 10),
  (null, 'Autres',               'autres',             true, 11);

-- ---------- RLS activé partout (politiques à l'étape 4) ----------
alter table public.families         enable row level security;
alter table public.family_members   enable row level security;
alter table public.profiles         enable row level security;
alter table public.profile_managers enable row level security;
alter table public.wishlists        enable row level security;
alter table public.categories       enable row level security;
alter table public.gifts            enable row level security;
alter table public.invitations      enable row level security;
alter table public.notifications    enable row level security;
alter table public.user_preferences enable row level security;