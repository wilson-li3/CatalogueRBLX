-- Drip Check — Supabase schema migration
-- Run this in the Supabase SQL Editor to set up the database

CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outfits_slug ON outfits (slug);
CREATE INDEX IF NOT EXISTS idx_outfits_trending ON outfits (vote_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_created ON outfits (created_at DESC);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(outfit_id, voter_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_votes_outfit ON votes (outfit_id);

-- RLS policies (all writes go through service role key in API routes)
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access for outfits
CREATE POLICY "Public read outfits" ON outfits
  FOR SELECT USING (true);

-- Public read access for votes (to check if user voted)
CREATE POLICY "Public read votes" ON votes
  FOR SELECT USING (true);
