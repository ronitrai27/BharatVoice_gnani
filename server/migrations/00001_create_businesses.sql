-- +goose Up
-- One row per shop. owner_user_id is the Better Auth user id (auth."user".id).
-- It is plain text on purpose, with no foreign key: the auth schema belongs to
-- the Next.js app and Go never reads or writes it.
CREATE TABLE businesses (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id text        NOT NULL UNIQUE,
    shop_name     text        NOT NULL,
    category      text        NOT NULL,
    city          text        NOT NULL,
    owner_phone   text        NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE businesses;
