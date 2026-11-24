-- Reposts: public counts on published stories. Saves: private to each user.
-- Run after 008_story_like_policies.sql.

alter table public.story_reposts enable row level security;
alter table public.saved_stories enable row level security;

create policy "anyone can read reposts on published stories" on public.story_reposts for select to anon, authenticated using (exists (select 1 from public.stories where stories.id = story_reposts.story_id and stories.status = 'published'));
create policy "users repost published stories as themselves" on public.story_reposts for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.stories where stories.id = story_reposts.story_id and stories.status = 'published'));
create policy "users remove their own reposts" on public.story_reposts for delete to authenticated using (user_id = auth.uid());

create policy "users read their own saves" on public.saved_stories for select to authenticated using (user_id = auth.uid());
create policy "users save published stories as themselves" on public.saved_stories for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.stories where stories.id = saved_stories.story_id and stories.status = 'published'));
create policy "users remove their own saves" on public.saved_stories for delete to authenticated using (user_id = auth.uid());
