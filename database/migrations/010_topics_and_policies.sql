-- Topics for Discover filtering. Run after 009_story_repost_save_policies.sql.

insert into public.topics (name, slug) values
    ('Environment', 'environment'),
    ('Culture', 'culture'),
    ('Health', 'health'),
    ('Money', 'money'),
    ('Science', 'science')
on conflict (slug) do nothing;

alter table public.topics enable row level security;
alter table public.story_topics enable row level security;

create policy "anyone can read topics" on public.topics for select to anon, authenticated using (true);
create policy "anyone can read topics of published stories" on public.story_topics for select to anon, authenticated using (exists (select 1 from public.stories where stories.id = story_topics.story_id and stories.status = 'published'));
create policy "authors read topics of their own stories" on public.story_topics for select to authenticated using (exists (select 1 from public.stories where stories.id = story_topics.story_id and stories.author_id = auth.uid()));
create policy "authors tag their own stories" on public.story_topics for insert to authenticated with check (exists (select 1 from public.stories where stories.id = story_topics.story_id and stories.author_id = auth.uid()));
create policy "authors untag their own stories" on public.story_topics for delete to authenticated using (exists (select 1 from public.stories where stories.id = story_topics.story_id and stories.author_id = auth.uid()));
