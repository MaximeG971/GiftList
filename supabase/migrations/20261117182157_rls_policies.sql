-- =====================================================================
-- GiftList : fonctions d'aide, droits et politiques RLS
-- =====================================================================

-- ---------- Schéma privé (non exposé par l'API) ----------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_family_member(fid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = fid
      and fm.user_id = (select auth.uid())
      and fm.status = 'active'
  );
$$;

create or replace function private.is_family_admin(fid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = fid
      and fm.user_id = (select auth.uid())
      and fm.status = 'active'
      and fm.role = 'admin'
  );
$$;

-- Propriétaire adulte (profil actif) ou gestionnaire désigné
create or replace function private.can_manage_profile(pid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = pid
      and p.status = 'active'
      and (
        (p.type = 'adult'
          and p.user_id = (select auth.uid())
          and private.is_family_member(p.family_id))
        or exists (
          select 1
          from public.profile_managers pm
          join public.family_members fm on fm.id = pm.family_member_id
          where pm.profile_id = p.id
            and fm.user_id = (select auth.uid())
            and fm.status = 'active'
        )
      )
  );
$$;

create or replace function private.can_manage_wishlist(wid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.wishlists w
    where w.id = wid and private.can_manage_profile(w.profile_id)
  );
$$;

revoke all on function
  private.is_family_member(uuid),
  private.is_family_admin(uuid),
  private.can_manage_profile(uuid),
  private.can_manage_wishlist(uuid)
from public, anon;
grant execute on function
  private.is_family_member(uuid),
  private.is_family_admin(uuid),
  private.can_manage_profile(uuid),
  private.can_manage_wishlist(uuid)
to authenticated, service_role;

-- ---------- Droits sur les tables ----------
-- (exposition automatique désactivée : on accorde explicitement)
-- anon n'a aucun droit. service_role : accès complet pour Nitro.
grant all on all tables in schema public to service_role;

grant select on public.families, public.family_members, public.profiles,
  public.profile_managers, public.wishlists, public.categories,
  public.gifts, public.notifications to authenticated;

-- invitations : tout sauf le hash du jeton
grant select (id, family_id, status, expires_at, created_by, used_by,
  used_at, revoked_at, created_at) on public.invitations to authenticated;

grant update (name, accent_color, avatar_type, avatar_path)
  on public.families to authenticated;
grant delete on public.families to authenticated;

grant update (first_name, avatar_path) on public.profiles to authenticated;

grant insert (family_id, name, slug, is_default, position)
  on public.categories to authenticated;
grant update (name, position) on public.categories to authenticated;

grant insert (wishlist_id, family_id, category_id, title, url, image_path,
  image_url, price, merchant, quantity, size, color, comment,
  visibility_status, received_status) on public.gifts to authenticated;
grant update (category_id, title, url, image_path, image_url, price,
  merchant, quantity, size, color, comment, visibility_status,
  received_status) on public.gifts to authenticated;
grant delete on public.gifts to authenticated;

grant update (read_at) on public.notifications to authenticated;

grant select, insert, update (wishlist_display_mode)
  on public.user_preferences to authenticated;
grant insert (user_id, wishlist_display_mode)
  on public.user_preferences to authenticated;

-- ---------- families ----------
create policy families_select on public.families
  for select to authenticated
  using (private.is_family_member(id));

create policy families_update on public.families
  for update to authenticated
  using (private.is_family_admin(id))
  with check (private.is_family_admin(id));

create policy families_delete on public.families
  for delete to authenticated
  using (private.is_family_admin(id));

-- ---------- family_members (lecture seule côté client) ----------
create policy family_members_select on public.family_members
  for select to authenticated
  using (private.is_family_member(family_id));

-- ---------- profiles ----------
-- Les membres voient les profils actifs ; les admins voient aussi
-- les profils inactifs et archivés.
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    private.is_family_member(family_id)
    and (status = 'active' or private.is_family_admin(family_id))
  );

-- Adulte : modifie son propre profil. Admin : métadonnées des profils enfants.
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (type = 'adult' and user_id = (select auth.uid()) and status = 'active')
  with check (type = 'adult' and user_id = (select auth.uid()));

create policy profiles_update_child_admin on public.profiles
  for update to authenticated
  using (type = 'child' and private.is_family_admin(family_id))
  with check (type = 'child' and private.is_family_admin(family_id));

-- ---------- profile_managers (lecture seule côté client) ----------
create policy profile_managers_select on public.profile_managers
  for select to authenticated
  using (private.is_family_member(family_id));

-- ---------- wishlists ----------
-- Visible si le profil l'est (RLS de profiles appliquée dans la sous-requête)
create policy wishlists_select on public.wishlists
  for select to authenticated
  using (
    private.is_family_member(family_id)
    and exists (select 1 from public.profiles p where p.id = wishlists.profile_id)
  );

-- ---------- categories ----------
create policy categories_select on public.categories
  for select to authenticated
  using (family_id is null or private.is_family_member(family_id));

create policy categories_insert on public.categories
  for insert to authenticated
  with check (
    family_id is not null
    and is_default = false
    and private.is_family_admin(family_id)
  );

create policy categories_update on public.categories
  for update to authenticated
  using (family_id is not null and is_default = false
         and private.is_family_admin(family_id))
  with check (family_id is not null and is_default = false
              and private.is_family_admin(family_id));
-- Suppression : serveur uniquement (déplacement des cadeaux avant suppression)

-- ---------- gifts ----------
create policy gifts_select on public.gifts
  for select to authenticated
  using (
    private.is_family_member(family_id)
    and exists (select 1 from public.wishlists w where w.id = gifts.wishlist_id)
    and (visibility_status = 'active' or private.can_manage_wishlist(wishlist_id))
  );

create policy gifts_insert on public.gifts
  for insert to authenticated
  with check (private.can_manage_wishlist(wishlist_id));

create policy gifts_update on public.gifts
  for update to authenticated
  using (private.can_manage_wishlist(wishlist_id))
  with check (private.can_manage_wishlist(wishlist_id));

create policy gifts_delete on public.gifts
  for delete to authenticated
  using (private.can_manage_wishlist(wishlist_id));

-- ---------- invitations (lecture admin, écriture serveur) ----------
create policy invitations_select on public.invitations
  for select to authenticated
  using (private.is_family_admin(family_id));

-- ---------- notifications ----------
create policy notifications_select on public.notifications
  for select to authenticated
  using (recipient_user_id = (select auth.uid()));

create policy notifications_update on public.notifications
  for update to authenticated
  using (recipient_user_id = (select auth.uid()))
  with check (recipient_user_id = (select auth.uid()));

-- ---------- user_preferences ----------
create policy user_preferences_all on public.user_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));