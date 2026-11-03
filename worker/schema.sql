-- Crowdsourced YMM tasdik fee quotes.
-- Only ever read back as aggregates (medians/ranges/anonymous fee arrays).
CREATE TABLE IF NOT EXISTS quotes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  bracket        TEXT    NOT NULL,               -- yıllık ciro aralığı (see BRACKETS)
  fee            INTEGER NOT NULL,               -- YMM ücreti, TL
  annual_revenue INTEGER,                        -- türetilen yıllık ciro, TL
  year           INTEGER,                        -- vergi yılı
  status         TEXT    NOT NULL DEFAULT 'approved', -- 'approved' | 'hidden'
  ip_hash        TEXT,                           -- SHA-256(ip), spam/rate-limit only
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quotes_status_bracket ON quotes(status, bracket);
CREATE INDEX IF NOT EXISTS idx_quotes_ip_time        ON quotes(ip_hash, created_at);
