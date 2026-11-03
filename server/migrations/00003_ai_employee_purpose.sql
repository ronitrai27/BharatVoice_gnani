-- +goose Up
-- Onboarding now asks "why do you want to use this?" as free text instead of
-- a fixed list of use cases.
ALTER TABLE ai_employees ADD COLUMN purpose text NOT NULL DEFAULT '';
ALTER TABLE ai_employees DROP COLUMN use_cases;

-- +goose Down
ALTER TABLE ai_employees ADD COLUMN use_cases text[] NOT NULL DEFAULT '{}';
ALTER TABLE ai_employees DROP COLUMN purpose;
