-- RLS policies for processed dataset metadata saved with a story draft.
-- Run after 003_story_draft_policies.sql.

alter table public.story_datasets enable row level security;

create policy "authors can read their datasets" on public.story_datasets for select to authenticated using (exists (select 1 from public.stories where stories.id = story_datasets.story_id and stories.author_id = auth.uid()));
create policy "authors can create their datasets" on public.story_datasets for insert to authenticated with check (exists (select 1 from public.stories where stories.id = story_datasets.story_id and stories.author_id = auth.uid()));
create policy "authors can update their datasets" on public.story_datasets for update to authenticated using (exists (select 1 from public.stories where stories.id = story_datasets.story_id and stories.author_id = auth.uid())) with check (exists (select 1 from public.stories where stories.id = story_datasets.story_id and stories.author_id = auth.uid()));
