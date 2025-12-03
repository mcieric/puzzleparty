-- Seed Badges
insert into public.badges (id, name, description, tier, image_url) values
('first_mint', 'First Mint', 'Minted your first puzzle piece', 'Bronze', '/badges/first_mint.png'),
('early_bird', 'Early Bird', 'Minted in the first 10% of a puzzle', 'Silver', '/badges/early_bird.png'),
('sniper_king', 'Sniper King', 'Won a puzzle by sniping the last piece', 'Gold', '/badges/sniper_king.png'),
('puzzle_master', 'Puzzle Master', 'Completed 10 puzzles', 'Diamond', '/badges/puzzle_master.png')
on conflict (id) do nothing;
