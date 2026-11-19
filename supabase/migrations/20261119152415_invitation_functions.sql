create or replace function public.accept_invitation(
  p_token_hash text,
  p_user_id uuid,
  p_first_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.invitations%rowtype;
  v_member public.family_members%rowtype;
  v_was_member boolean;
  v_reactivated integer;
begin
  -- verrou de ligne : deux utilisations concurrentes ne peuvent pas réussir
  select * into v_inv
  from public.invitations
  where token_hash = p_token_hash
  for update;

  if not found or v_inv.status <> 'pending' or v_inv.expires_at <= now() then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into v_member
  from public.family_members
  where family_id = v_inv.family_id and user_id = p_user_id;
  v_was_member := found;

  if v_was_member and v_member.status = 'active' then
    return jsonb_build_object('status', 'already_member', 'family_id', v_inv.family_id);
  end if;

  if v_was_member then
    update public.family_members
    set status = 'active', role = 'member', left_at = null, joined_at = now()
    where id = v_member.id;

    update public.profiles
    set status = 'active'
    where family_id = v_inv.family_id and user_id = p_user_id and type = 'adult';
    get diagnostics v_reactivated = row_count;

    if v_reactivated = 0 then
      insert into public.profiles (family_id, user_id, first_name, type)
      values (v_inv.family_id, p_user_id, p_first_name, 'adult');
    end if;
  else
    insert into public.family_members (family_id, user_id)
    values (v_inv.family_id, p_user_id);

    insert into public.profiles (family_id, user_id, first_name, type)
    values (v_inv.family_id, p_user_id, p_first_name, 'adult');
  end if;

  update public.invitations
  set status = 'used', used_by = p_user_id, used_at = now()
  where id = v_inv.id;

  insert into public.notifications (family_id, recipient_user_id, type, payload)
  select v_inv.family_id, fm.user_id, 'member_joined',
         jsonb_build_object('first_name', p_first_name)
  from public.family_members fm
  where fm.family_id = v_inv.family_id
    and fm.role = 'admin'
    and fm.status = 'active'
    and fm.user_id <> p_user_id;

  return jsonb_build_object('status', 'joined', 'family_id', v_inv.family_id);
end;
$$;

revoke all on function public.accept_invitation(text, uuid, text) from public, anon, authenticated;
grant execute on function public.accept_invitation(text, uuid, text) to service_role;