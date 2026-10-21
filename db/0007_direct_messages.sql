CREATE TABLE direct_messages (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  recipient_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 1500),
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(sender_id <> recipient_id)
);
CREATE INDEX direct_messages_sender_pair ON direct_messages(sender_id,recipient_id,seq DESC);
CREATE INDEX direct_messages_recipient_pair ON direct_messages(recipient_id,sender_id,seq DESC);
CREATE INDEX direct_messages_unread ON direct_messages(recipient_id,read_at,seq);
CREATE TABLE direct_message_blocks (
  blocker_id TEXT NOT NULL REFERENCES users(id),
  blocked_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(blocker_id,blocked_id),
  CHECK(blocker_id<>blocked_id)
);
