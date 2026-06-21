-- Seed initial project
insert into public.projects (name, target_ppmph, active)
values ('Legends', 0.65, true)
on conflict (name) do nothing;
