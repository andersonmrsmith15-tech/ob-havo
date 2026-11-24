CREATE TABLE IF NOT EXISTS obunachilar (
  id SERIAL PRIMARY KEY,
  ism TEXT NOT NULL CHECK (char_length(ism) BETWEEN 2 AND 80),
  telefon TEXT NOT NULL CHECK (char_length(telefon) BETWEEN 7 AND 20),
  shahar TEXT NOT NULL,
  ogohlantirish TEXT[] NOT NULL DEFAULT '{}',
  izoh TEXT CHECK (izoh IS NULL OR char_length(izoh) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
