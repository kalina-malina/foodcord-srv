export const addTableAuth = `
-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;

-- =========================
-- Пользователи
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY not null,                 -- уникальный идентификатор пользователя
    last_name text,
    first_name text,
    middle_name text,
    role text,
    email CITEXT UNIQUE NOT NULL,             -- email пользователя (логин), без учета регистра
    id_store BIGINT,                          -- идентификатор магазина, к которому привязан пользователь
    password_hash TEXT NOT NULL,              -- bcrypt/argon2 хэш пароля
    locked BOOLEAN NOT NULL DEFAULT true,  -- активен ли пользователь
    created_at TIMESTAMP NOT NULL DEFAULT now(),  -- дата создания записи
    update_at TIMESTAMP NOT NULL DEFAULT now() -- время обнолвения
);

COMMENT ON COLUMN users.id IS 'Уникальный числовой идентификатор пользователя';
COMMENT ON COLUMN users.email IS 'Email пользователя, используется для логина';
COMMENT ON COLUMN users.id_store IS 'Идентификатор магазина';
COMMENT ON COLUMN users.password_hash IS 'Хэш пароля пользователя';
COMMENT ON COLUMN users.locked IS 'Флаг активности пользователя';
COMMENT ON COLUMN users.created_at IS 'Дата создания пользователя';

-- =========================
-- Refresh-токены (для каждого устройства)
-- =========================
CREATE TABLE IF NOT EXISTS users_tokens (
    id BIGSERIAL PRIMARY KEY,                  -- уникальный идентификатор токена
    id_user BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- ссылка на пользователя
    refresh_token TEXT NOT NULL,                  -- sha256 хэш refresh-токена
    device TEXT,                          -- название/тип устройства (iPhone, Laptop и т.д.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- дата создания токена
    expires_at TIMESTAMPTZ NOT NULL,           -- дата истечения токена
    revoked_at TIMESTAMPTZ,                    -- дата отзыва токена
    UNIQUE (refresh_token)
);

COMMENT ON COLUMN users_tokens.id IS 'Уникальный числовой идентификатор токена';
COMMENT ON COLUMN users_tokens.id_user IS 'ID пользователя, которому принадлежит токен';
COMMENT ON COLUMN users_tokens.refresh_token IS 'Хэш refresh-токена для безопасности';
COMMENT ON COLUMN users_tokens.device IS 'Название или тип устройства';
COMMENT ON COLUMN users_tokens.created_at IS 'Дата создания токена';
COMMENT ON COLUMN users_tokens.expires_at IS 'Дата истечения срока действия токена';
COMMENT ON COLUMN users_tokens.revoked_at IS 'Дата отзыва токена';

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_refresh_user ON users_tokens(id_user);
CREATE INDEX IF NOT EXISTS idx_refresh_expires ON users_tokens(expires_at);

-- Функция-триггер для удаления токенов при деактивации пользователя
CREATE OR REPLACE FUNCTION delete_tokens_on_deactivate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.locked = false AND OLD.locked = true THEN
    DELETE FROM users_tokens WHERE id_user = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на таблицу users
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE t.tgname = 'trg_delete_tokens'
      AND c.relname = 'users'
  ) THEN
    CREATE TRIGGER trg_delete_tokens
    AFTER UPDATE OF locked ON users
    FOR EACH ROW
    WHEN (OLD.locked IS DISTINCT FROM NEW.locked)
    EXECUTE FUNCTION delete_tokens_on_deactivate();
  END IF;
END
$do$;
`;
