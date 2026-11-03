-- BFK reviews: run once in Supabase -> SQL Editor -> New query -> Run.
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  event_type text not null check (event_type in ('Wedding','Couple shoot','Birthday','Other')),
  event_date date,
  rating smallint not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 2000),
  photo_url text,
  approved boolean not null default false
);
alter table public.reviews enable row level security;

drop policy if exists "anon insert pending" on public.reviews;
create policy "anon insert pending" on public.reviews
  for insert to anon with check (approved = false);

drop policy if exists "anon read approved" on public.reviews;
create policy "anon read approved" on public.reviews
  for select to anon using (approved = true);

-- Only these columns are writable/readable by anon (no update/delete policies exist).
revoke all on public.reviews from anon;
grant insert (name, event_type, event_date, rating, text, photo_url, approved) on public.reviews to anon;
grant select on public.reviews to anon;

-- Photo bucket: public read, 2 MB limit, JPEG/PNG/WebP only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "anon upload review photos" on storage.objects;
create policy "anon upload review photos" on storage.objects
  for insert to anon with check (bucket_id = 'review-photos');
-- No select/update/delete policies for anon: files are served via the public URL only,
-- and visitors cannot list, overwrite or delete them.
