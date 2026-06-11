create table public.lead_events (
    id uuid primary key default gen_random_uuid(),
    event_type text not null check (event_type in ('whatsapp_click', 'chat_open', 'contact_submit', 'course_enquiry')),
    source_url text,
    user_agent text,
    user_id uuid references auth.users(id) on delete set null,
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

grant select, insert on public.lead_events to anon;
grant select, insert on public.lead_events to authenticated;
grant all on public.lead_events to service_role;

alter table public.lead_events enable row level security;

create policy "Anyone can insert lead events"
on public.lead_events
for insert
to anon, authenticated
with check (event_type in ('whatsapp_click', 'chat_open', 'contact_submit', 'course_enquiry'));

create policy "Admins can view all lead events"
on public.lead_events
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));