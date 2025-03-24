-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade,
  email text,
  first_name text,
  last_name text,
  username text unique,
  phone_number text,
  profile_picture_url text,
  location text,
  sign_up_location text,
  app_identifier text,
  created_at timestamp with time zone,
  social_auth_type text,
  primary key (id)
);

-- Enable RLS
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own data" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can delete their own data" on public.users
  for delete using (auth.uid() = id);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 