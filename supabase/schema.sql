-- Événements créés via EventPing
CREATE TABLE events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  date        DATE        NOT NULL,
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  description TEXT,
  location    TEXT,
  created_by  TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX events_date_idx ON events (date, start_time);

-- Tentatives de connexion pour le rate limiting
CREATE TABLE login_attempts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip         TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX login_attempts_ip_idx ON login_attempts (ip, created_at);

-- Nettoyage automatique des vieilles tentatives (> 1h)
CREATE OR REPLACE FUNCTION delete_old_login_attempts() RETURNS trigger AS $$
BEGIN
  DELETE FROM login_attempts WHERE created_at < now() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_login_attempts
  AFTER INSERT ON login_attempts
  EXECUTE FUNCTION delete_old_login_attempts();
