
create table signals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc', now()),
  address text not null,
  violence_type text[] not null,
  description text,
  attachment_url text,
  is_anonymous boolean default true,
  contact_email text
);
