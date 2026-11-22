-- Repair migration for projects where 005 was skipped or did not apply.
-- Safe to run after the earlier migrations.

alter table public.story_blocks drop constraint if exists story_blocks_type;
alter table public.story_blocks add constraint story_blocks_type check (block_type in ('text', 'chart', 'scrollytelling'));
