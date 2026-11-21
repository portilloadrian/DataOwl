-- DataOwls MVP schema for Supabase/PostgreSQL.
-- Original CSV files are intentionally not stored. The processed chart-ready
-- data is kept in story_datasets.processed_data and chart story-block content.

create extension if not exists pgcrypto;

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    display_name text,
    bio text not null default '',
    role text,
    icon_key text not null default 'noun_Owl_7392195.svg',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint profiles_username_length check (char_length(username) between 2 and 40),
    constraint profiles_icon_key check (icon_key in (
        'noun_Owl_7392195.svg',
        'noun_Owl_7417114.svg',
        'noun_Owl_7562088.svg',
        'noun_Owl_7834524.svg'
    ))
);

create table public.stories (
    id uuid primary key default gen_random_uuid(),
    author_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    description text not null default '',
    status text not null default 'draft',
    view_count bigint not null default 0,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint stories_status check (status in ('draft', 'published')),
    constraint stories_title_length check (char_length(title) between 1 and 200),
    constraint stories_published_state check (
        (status = 'draft' and published_at is null)
        or (status = 'published' and published_at is not null)
    )
);

-- One processed dataset per story. No original file or storage path is kept.
create table public.story_datasets (
    id uuid primary key default gen_random_uuid(),
    story_id uuid not null unique references public.stories(id) on delete cascade,
    source_filename text not null,
    columns jsonb not null default '[]'::jsonb,
    processed_data jsonb not null,
    row_count integer not null default 0,
    created_at timestamptz not null default now(),
    constraint story_datasets_row_count check (row_count >= 0),
    constraint story_datasets_columns_array check (jsonb_typeof(columns) = 'array'),
    constraint story_datasets_data_object check (jsonb_typeof(processed_data) = 'object')
);

create table public.story_blocks (
    id uuid primary key default gen_random_uuid(),
    story_id uuid not null references public.stories(id) on delete cascade,
    position integer not null,
    block_type text not null,
    content jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint story_blocks_position check (position >= 0),
    constraint story_blocks_type check (block_type in ('text', 'chart')),
    constraint story_blocks_content_object check (jsonb_typeof(content) = 'object'),
    unique (story_id, position)
);

create table public.comments (
    id uuid primary key default gen_random_uuid(),
    story_id uuid not null references public.stories(id) on delete cascade,
    author_id uuid not null references public.profiles(id) on delete cascade,
    parent_comment_id uuid references public.comments(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default now(),
    constraint comments_body_length check (char_length(body) between 1 and 5000)
);

-- A trigger below prevents replies to replies, keeping threads one level deep.
create or replace function public.prevent_nested_comment_replies()
returns trigger
language plpgsql
as $$
begin
    if new.parent_comment_id is not null and exists (
        select 1 from public.comments
        where id = new.parent_comment_id and parent_comment_id is not null
    ) then
        raise exception 'Replies can only target top-level comments';
    end if;
    return new;
end;
$$;

create trigger comments_one_level_replies
before insert or update of parent_comment_id on public.comments
for each row execute function public.prevent_nested_comment_replies();

create table public.story_likes (
    story_id uuid not null references public.stories(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (story_id, user_id)
);

create table public.saved_stories (
    story_id uuid not null references public.stories(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (story_id, user_id)
);

-- Reposts point at the original story and are not independent Discover stories.
create table public.story_reposts (
    story_id uuid not null references public.stories(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (story_id, user_id)
);

create table public.topics (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    kind text not null default 'topic',
    constraint topics_kind check (kind in ('topic', 'descriptor'))
);

create table public.story_topics (
    story_id uuid not null references public.stories(id) on delete cascade,
    topic_id uuid not null references public.topics(id) on delete cascade,
    primary key (story_id, topic_id)
);

create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    recipient_id uuid not null references public.profiles(id) on delete cascade,
    actor_id uuid not null references public.profiles(id) on delete cascade,
    story_id uuid references public.stories(id) on delete cascade,
    comment_id uuid references public.comments(id) on delete cascade,
    notification_type text not null,
    read_at timestamptz,
    created_at timestamptz not null default now(),
    constraint notifications_type check (notification_type in ('like', 'comment', 'reply', 'repost')),
    constraint notifications_not_self check (recipient_id <> actor_id)
);

create index stories_author_id_idx on public.stories(author_id);
create index stories_published_idx on public.stories(status, published_at desc);
create index story_blocks_story_position_idx on public.story_blocks(story_id, position);
create index comments_story_created_idx on public.comments(story_id, created_at);
create index notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);
create index notifications_unread_idx on public.notifications(recipient_id) where read_at is null;

-- Keep updated_at values current for editable records.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger stories_set_updated_at before update on public.stories
for each row execute function public.set_updated_at();

create trigger story_blocks_set_updated_at before update on public.story_blocks
for each row execute function public.set_updated_at();
