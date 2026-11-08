insert into public.topics (name, slug, kind) values
    ('Environment', 'environment', 'topic'),
    ('Economics', 'economics', 'topic'),
    ('Health', 'health', 'topic'),
    ('Demographics', 'demographics', 'topic'),
    ('Technology', 'technology', 'topic'),
    ('Education', 'education', 'topic'),
    ('Politics', 'politics', 'topic'),
    ('Science', 'science', 'topic'),
    ('Culture', 'culture', 'topic'),
    ('Sports', 'sports', 'topic'),
    ('Beginner-friendly', 'beginner-friendly', 'descriptor'),
    ('Survey data', 'survey-data', 'descriptor'),
    ('Time series', 'time-series', 'descriptor'),
    ('Geographic data', 'geographic-data', 'descriptor'),
    ('Public data', 'public-data', 'descriptor'),
    ('Interactive', 'interactive', 'descriptor')
on conflict (slug) do nothing;
