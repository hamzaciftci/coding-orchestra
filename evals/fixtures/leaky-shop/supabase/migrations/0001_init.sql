create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "notes are readable" on public.notes
  for select using (auth.uid() = owner_id);

create policy "notes are editable" on public.notes
  for update using (true);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id),
  amount_cents integer not null,
  created_at timestamptz not null default now()
);
