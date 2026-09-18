CREATE TABLE public.messages (
    id bigint generated always as identity primary key,
    sender_id uuid references auth.users(id),
    receiver_id uuid references auth.users(id),
    message text,
    is_read boolean default false,
    created_at timestamptz default now()
);