-- Add the reusable scroll-reveal story template block.
-- Run after 001-004 migrations.

alter table public.story_blocks drop constraint if exists story_blocks_type;
alter table public.story_blocks add constraint story_blocks_type check (block_type in ('text', 'chart', 'scrollytelling'));
