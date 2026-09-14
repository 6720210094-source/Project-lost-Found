-- =========================================
-- Chat tables for Lost & Found
-- Run this in Supabase SQL Editor
-- =========================================

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  user1_id uuid not null,
  user2_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat rooms allow all" on public.chat_rooms;
create policy "chat rooms allow all" on public.chat_rooms
for all using (true);

drop policy if exists "chat messages allow all" on public.chat_messages;
create policy "chat messages allow all" on public.chat_messages
for all using (true);

create index if not exists idx_chat_rooms_item_id on public.chat_rooms(item_id);
create index if not exists idx_chat_messages_room_id on public.chat_messages(room_id);
