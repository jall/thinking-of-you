-- nicknames a friend goes by, comma separated; helps match dictated names ("sofs" -> Sophs)
alter table public.friends add column aliases text check (aliases is null or char_length(aliases) < 500);
