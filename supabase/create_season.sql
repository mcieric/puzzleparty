-- Create an active season for testing
-- Run this in Supabase SQL Editor

insert into public.seasons (name, start_date, end_date, is_active)
values (
    'Season 1',
    now(),
    now() + interval '30 days',
    true
)
on conflict do nothing;
