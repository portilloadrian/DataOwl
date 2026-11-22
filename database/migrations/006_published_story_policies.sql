-- Allow anonymous readers to view published stories only.
-- Run after 005_scrollytelling_block.sql.

create policy "anyone can read published stories" on public.stories for select to anon, authenticated using (status = 'published');
create policy "anyone can read published story blocks" on public.story_blocks for select to anon, authenticated using (exists (select 1 from public.stories where stories.id = story_blocks.story_id and stories.status = 'published'));
create policy "anyone can read published story datasets" on public.story_datasets for select to anon, authenticated using (exists (select 1 from public.stories where stories.id = story_datasets.story_id and stories.status = 'published'));
