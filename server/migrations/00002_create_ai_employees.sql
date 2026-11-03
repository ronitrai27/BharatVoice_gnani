-- +goose Up
-- The voice agent for a business. It is a separate table so a business can
-- have more than one AI employee later.
CREATE TABLE ai_employees (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
    name        text        NOT NULL,
    language    text        NOT NULL,
    use_cases   text[]      NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_employees_business_id_idx ON ai_employees (business_id);

-- +goose Down
DROP TABLE ai_employees;
