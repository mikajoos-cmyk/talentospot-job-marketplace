-- Create the table if it doesn't exist
create table if not exists candidate_awards (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references candidate_profiles(id) on delete cascade not null,
  title text not null,
  year text,
  description text,
  certificate_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table candidate_awards enable row level security;

-- Policy 1: Allow read access to everyone (since profiles are generally public or controlled by profile visibility)
-- You might want to restrict this based on the candidate_profile visibility if needed, but usually profile components are public.
create policy "Awards are viewable by everyone"
  on candidate_awards for select
  using ( true );

-- Policy 2: Allow insert for the owner
create policy "Users can insert their own awards"
  on candidate_awards for insert
  with check ( auth.uid() = candidate_id );

-- Policy 3: Allow update for the owner
create policy "Users can update their own awards"
  on candidate_awards for update
  using ( auth.uid() = candidate_id );

-- Policy 4: Allow delete for the owner
create policy "Users can delete their own awards"
  on candidate_awards for delete
  using ( auth.uid() = candidate_id );

-- Grant permissions (if needed for your role setup)
grant all on candidate_awards to authenticated;
grant select on candidate_awards to anon;
