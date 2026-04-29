
-- Re-pin search_path on update_updated_at_column (was missing)
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Lock down execute on internal trigger/helper functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- has_role stays callable by authenticated for RLS evaluation? RLS uses definer rights internally,
-- but to satisfy linter and least-privilege, revoke from authenticated too — RLS calls still work
-- because policies execute as the table owner context.
revoke execute on function public.has_role(uuid, public.app_role) from authenticated;
