-- RLS policies for the first persisted story-editor flow.
-- Run after 001_initial_schema.sql and 002_create_profile_on_signup.sql.

alter table public.stories enable row level security;
alter table public.story_blocks enable row level security;

create policy "authors can read their stories" on public.stories for select to authenticated using (author_id = auth.uid());
create policy "authors can create their stories" on public.stories for insert to authenticated with check (author_id = auth.uid());
create policy "authors can update their stories" on public.stories for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy "authors can read their story blocks" on public.story_blocks for select to authenticated using (exists (select 1 from public.stories where stories.id = story_blocks.story_id and stories.author_id = auth.uid()));
create policy "authors can create their story blocks" on public.story_blocks for insert to authenticated with check (exists (select 1 from public.stories where stories.id = story_blocks.story_id and stories.author_id = auth.uid()));
create policy "authors can update their story blocks" on public.story_blocks for update to authenticated using (exists (select 1 from public.stories where stories.id = story_blocks.story_id and stories.author_id = auth.uid())) with check (exists (select 1 from public.stories where stories.id = story_blocks.story_id and stories.author_id = auth.uid()));
create policy "authors can delete their story blocks" on public.story_blocks for delete to authenticated using (exists (select 1 from public.stories where stories.id = story_blocks.story_id and stories.author_id = auth.uid()));

