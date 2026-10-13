ALTER TABLE profiles ADD COLUMN ai_consent INTEGER NOT NULL DEFAULT 0;
CREATE TABLE ai_match_cache (user_id TEXT NOT NULL REFERENCES users(id), peer_id TEXT NOT NULL REFERENCES users(id), input_hash TEXT NOT NULL, explanation TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,peer_id,input_hash));
CREATE TABLE ai_daily_usage (user_id TEXT NOT NULL REFERENCES users(id), day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(user_id,day));
