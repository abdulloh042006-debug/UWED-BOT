CREATE TABLE verification_evidence (
  request_id TEXT PRIMARY KEY REFERENCES verification_requests(id),
  owner_id TEXT NOT NULL REFERENCES users(id),
  storage_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK(content_type IN ('application/pdf','image/jpeg','image/png','image/webp')),
  size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 10485760),
  filename TEXT NOT NULL
);
CREATE INDEX verification_evidence_owner ON verification_evidence(owner_id);
