create or replace function public.create_family_with_admin(
  p_user_id uuid,
  p_first_name text,
  p_family_name text,
  p_accent_color text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family_id uuid;
begin
  insert into public.families (name, accent_color, created_by)
  values (p_family_name, p_accent_color, p_user_id)
  returning id into v_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (v_family_id, p_user_id, 'admin');

  -- la wishlist est créée par le trigger sur profiles
  insert into public.profiles (family_id, user_id, first_name, type)
  values (v_family_id, p_user_id, p_first_name, 'adult');

  return v_family_id;
end;
$$;

-- Appelable uniquement par le serveur (clé secrète)
revoke all on function public.create_family_with_admin(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_family_with_admin(uuid, text, text, text)
  to service_role;