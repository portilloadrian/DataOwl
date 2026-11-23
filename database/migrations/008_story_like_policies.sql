-- Likes: anyone can read them on published stories; signed-in users manage only their own.
-- Run after 007_repair_story_block_type.sql.

alter table public.story_likes enable row level security;

create policy "anyone can read likes on published stories" on public.story_likes for select to anon, authenticated using (exists (select 1 from public.stories where stories.id = story_likes.story_id and stories.status = 'published'));
create policy "users like published stories as themselves" on public.story_likes for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.stories where stories.id = story_likes.story_id and stories.status = 'published'));
create policy "users remove their own likes" on public.story_likes for delete to authenticated using (user_id = auth.uid());
