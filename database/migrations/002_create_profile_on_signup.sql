-- Create the public profile row when Supabase Auth creates a user.
-- The frontend supplies username and icon_key in raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    requested_username text;
    requested_icon text;
begin
    requested_username := nullif(new.raw_user_meta_data ->> 'username', '');
    requested_icon := new.raw_user_meta_data ->> 'icon_key';

    if requested_username is null then
        requested_username := 'user_' || replace(substr(new.id::text, 1, 8), '-', '');
    end if;

    if requested_icon not in (
        'noun_Owl_7392195.svg',
        'noun_Owl_7417114.svg',
        'noun_Owl_7562088.svg',
        'noun_Owl_7834524.svg'
    ) then
        requested_icon := 'noun_Owl_7392195.svg';
    end if;

    insert into public.profiles (id, username, icon_key)
    values (new.id, requested_username, requested_icon);

    return new;
end;
$$;

do $$
begin
    if not exists (
        select 1
        from pg_trigger
        where tgname = 'on_auth_user_created'
          and tgrelid = 'auth.users'::regclass
    ) then
        create trigger on_auth_user_created
        after insert on auth.users
        for each row execute function public.handle_new_user();
    end if;
end;
$$;
