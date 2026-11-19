-- ---------- Contrôle d'administrateur (acteur explicite) ----------
create or replace function private.assert_family_admin(p_actor uuid, p_family uuid)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.family_members
    where family_id = p_family and user_id = p_actor
      and status = 'active' and role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;
end;
$$;

revoke all on function private.assert_family_admin(uuid, uuid) from public, anon, authenticated;
grant execute on function private.assert_family_admin(uuid, uuid) to service_role;

-- ---------- Création d'un profil enfant ----------
create or replace function public.create_child_profile(
  p_actor uuid, p_family uuid, p_first_name text, p_manager_member_ids uuid[]
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_profile uuid;
  v_name text := trim(p_first_name);
begin
  perform private.assert_family_admin(p_actor, p_family);
  if char_length(v_name) not between 1 and 60 then raise exception 'invalid'; end if;

  insert into public.profiles (family_id, first_name, type)
  values (p_family, v_name, 'child')
  returning id into v_profile;

  insert into public.profile_managers (profile_id, family_member_id, family_id)
  select v_profile, fm.id, p_family
  from public.family_members fm
  where fm.family_id = p_family and fm.status = 'active'
    and fm.id = any (coalesce(p_manager_member_ids, '{}'));

  insert into public.notifications (family_id, recipient_user_id, type, payload)
  select p_family, fm.user_id, 'child_profile_created',
         jsonb_build_object('profile_id', v_profile, 'first_name', v_name)
  from public.profile_managers pm
  join public.family_members fm on fm.id = pm.family_member_id
  where pm.profile_id = v_profile and fm.user_id <> p_actor;

  return v_profile;
end;
$$;

-- ---------- Gestionnaires d'un profil enfant ----------
create or replace function public.set_profile_managers(
  p_actor uuid, p_profile uuid, p_member_ids uuid[]
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_family uuid;
begin
  select family_id into v_family
  from public.profiles where id = p_profile and type = 'child';
  if v_family is null then raise exception 'not_found'; end if;
  perform private.assert_family_admin(p_actor, v_family);

  delete from public.profile_managers
  where profile_id = p_profile
    and not (family_member_id = any (coalesce(p_member_ids, '{}')));

  insert into public.profile_managers (profile_id, family_member_id, family_id)
  select p_profile, fm.id, v_family
  from public.family_members fm
  where fm.family_id = v_family and fm.status = 'active'
    and fm.id = any (coalesce(p_member_ids, '{}'))
  on conflict do nothing;
end;
$$;

-- ---------- Archivage / restauration d'un profil enfant ----------
create or replace function public.set_child_status(
  p_actor uuid, p_profile uuid, p_status public.profile_status
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_family uuid;
  v_name text;
begin
  if p_status not in ('active', 'archived') then raise exception 'invalid'; end if;

  select family_id, first_name into v_family, v_name
  from public.profiles where id = p_profile and type = 'child';
  if v_family is null then raise exception 'not_found'; end if;
  perform private.assert_family_admin(p_actor, v_family);

  update public.profiles set status = p_status where id = p_profile;

  if p_status = 'archived' then
    insert into public.notifications (family_id, recipient_user_id, type, payload)
    select v_family, fm.user_id, 'child_profile_archived',
           jsonb_build_object('profile_id', p_profile, 'first_name', v_name)
    from public.profile_managers pm
    join public.family_members fm on fm.id = pm.family_member_id
    where pm.profile_id = p_profile and fm.user_id <> p_actor;
  end if;
end;
$$;

-- ---------- Suppression définitive (enfant archivé ou adulte inactif) ----------
create or replace function public.delete_profile(p_actor uuid, p_profile uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_family uuid;
begin
  select family_id into v_family
  from public.profiles
  where id = p_profile
    and ((type = 'child' and status = 'archived')
      or (type = 'adult' and status = 'inactive'));
  if v_family is null then raise exception 'not_found'; end if;
  perform private.assert_family_admin(p_actor, v_family);

  delete from public.profiles where id = p_profile; -- wishlist et cadeaux en cascade
end;
$$;

-- ---------- Rôle d'un membre ----------
create or replace function public.set_member_role(
  p_actor uuid, p_family uuid, p_member uuid, p_role public.family_role
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_member public.family_members%rowtype;
begin
  perform private.assert_family_admin(p_actor, p_family);

  select * into v_member from public.family_members
  where id = p_member and family_id = p_family and status = 'active'
  for update;
  if not found then raise exception 'not_found'; end if;

  if v_member.role = 'admin' and p_role = 'member' then
    perform 1 from public.family_members
    where family_id = p_family and role = 'admin' and status = 'active'
    for update;
    if (select count(*) from public.family_members
        where family_id = p_family and role = 'admin' and status = 'active') <= 1 then
      raise exception 'last_admin';
    end if;
  end if;

  update public.family_members set role = p_role where id = p_member;
end;
$$;

-- ---------- Retrait d'un membre OU départ volontaire ----------
create or replace function public.remove_member(
  p_actor uuid, p_family uuid, p_member uuid
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_member public.family_members%rowtype;
begin
  select * into v_member from public.family_members
  where id = p_member and family_id = p_family and status = 'active'
  for update;
  if not found then raise exception 'not_found'; end if;

  -- un membre peut se retirer lui-même ; sinon il faut être administrateur
  if v_member.user_id <> p_actor then
    perform private.assert_family_admin(p_actor, p_family);
  end if;

  if v_member.role = 'admin' then
    perform 1 from public.family_members
    where family_id = p_family and role = 'admin' and status = 'active'
    for update;
    if (select count(*) from public.family_members
        where family_id = p_family and role = 'admin' and status = 'active') <= 1 then
      raise exception 'last_admin';
    end if;
  end if;

  update public.family_members
  set status = 'removed', left_at = now()
  where id = p_member;

  -- profil et liste conservés, mais inactifs et non modifiables
  update public.profiles set status = 'inactive'
  where family_id = p_family and user_id = v_member.user_id and type = 'adult';

  delete from public.profile_managers where family_member_id = p_member;
end;
$$;

-- ---------- Transfert d'un profil adulte inactif ----------
create or replace function public.transfer_adult_profile(
  p_actor uuid, p_profile uuid, p_to_member uuid
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_family uuid;
  v_name text;
  v_to_user uuid;
begin
  select family_id, first_name into v_family, v_name
  from public.profiles
  where id = p_profile and type = 'adult' and status = 'inactive';
  if v_family is null then raise exception 'not_found'; end if;
  perform private.assert_family_admin(p_actor, v_family);

  select user_id into v_to_user from public.family_members
  where id = p_to_member and family_id = v_family and status = 'active';
  if v_to_user is null then raise exception 'invalid'; end if;

  -- le profil n'est plus rattaché à l'ancien compte, le destinataire en devient responsable
  update public.profiles set user_id = null, status = 'active' where id = p_profile;

  insert into public.profile_managers (profile_id, family_member_id, family_id)
  values (p_profile, p_to_member, v_family)
  on conflict do nothing;

  insert into public.notifications (family_id, recipient_user_id, type, payload)
  values (v_family, v_to_user, 'profile_transferred',
          jsonb_build_object('profile_id', p_profile, 'first_name', v_name));
end;
$$;

-- ---------- Droits : service_role uniquement ----------
do $$
declare
  f text;
begin
  for f in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'create_child_profile', 'set_profile_managers', 'set_child_status',
        'delete_profile', 'set_member_role', 'remove_member', 'transfer_adult_profile'
      )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;