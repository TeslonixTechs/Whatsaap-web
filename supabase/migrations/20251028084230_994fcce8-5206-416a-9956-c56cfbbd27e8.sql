-- Create RPC to insert assistant securely and return payload matching edge function expectations
create or replace function public.create_ai_assistant(
  p_user_id uuid,
  p_name text,
  p_description text,
  p_industry text,
  p_phone_number text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_assistant public.assistants%rowtype;
begin
  insert into public.assistants (user_id, name, business_description, industry, phone_number)
  values (p_user_id, p_name, p_description, p_industry, p_phone_number)
  returning * into new_assistant;

  return json_build_object('assistant', to_jsonb(new_assistant));
end;
$$;

-- Allow authenticated users to call it via RPC
grant execute on function public.create_ai_assistant(uuid, text, text, text, text) to authenticated;