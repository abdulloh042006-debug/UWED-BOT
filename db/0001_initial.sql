-- Apply once to local D1 before testing the Worker. Hosted migration wiring must be verified before publication.
CREATE TABLE users (id TEXT PRIMARY KEY, telegram_user_id TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','mentor','moderator','admin')), verified_university INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE profiles (user_id TEXT PRIMARY KEY REFERENCES users(id), faculty TEXT NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '', timezone TEXT NOT NULL DEFAULT 'Asia/Tashkent', interests TEXT NOT NULL DEFAULT '[]', languages TEXT NOT NULL DEFAULT '[]', privacy TEXT NOT NULL DEFAULT 'public' CHECK(privacy IN ('public','members','private')), notify_bot INTEGER NOT NULL DEFAULT 1);
CREATE TABLE skills (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, approved INTEGER NOT NULL DEFAULT 1);
CREATE TABLE user_skills (user_id TEXT NOT NULL REFERENCES users(id), skill_id TEXT NOT NULL REFERENCES skills(id), direction TEXT NOT NULL CHECK(direction IN ('teach','learn')), PRIMARY KEY(user_id,skill_id,direction));
CREATE TABLE availability (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6), start_minute INTEGER NOT NULL, end_minute INTEGER NOT NULL, CHECK(start_minute >= 0 AND end_minute <= 1440 AND start_minute < end_minute));
CREATE TABLE exchange_requests (id TEXT PRIMARY KEY, sender_id TEXT NOT NULL REFERENCES users(id), recipient_id TEXT NOT NULL REFERENCES users(id), skill_id TEXT NOT NULL REFERENCES skills(id), status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent','accepted','rejected','scheduled','completed','cancelled')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, CHECK(sender_id <> recipient_id));
CREATE UNIQUE INDEX active_request_unique ON exchange_requests(sender_id,recipient_id,skill_id) WHERE status IN ('sent','accepted','scheduled');
CREATE TABLE sessions (id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE REFERENCES exchange_requests(id), start_at TEXT NOT NULL, end_at TEXT NOT NULL, proposed_by TEXT NOT NULL REFERENCES users(id), confirmed_by TEXT REFERENCES users(id), status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('proposed','confirmed','cancelled','completed')), CHECK(start_at < end_at));
CREATE TABLE notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, body TEXT NOT NULL, target TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE bot_outbox (id TEXT PRIMARY KEY, notification_id TEXT NOT NULL UNIQUE REFERENCES notifications(id), status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_error TEXT);
CREATE TABLE webhook_events (update_id TEXT PRIMARY KEY, received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE verification_requests (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL CHECK(kind IN ('university','mentor')), status TEXT NOT NULL DEFAULT 'pending', reviewed_by TEXT REFERENCES users(id), reviewed_at TEXT, reason TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE audit_log (id TEXT PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL, object_type TEXT NOT NULL, object_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX availability_user ON availability(user_id);
CREATE INDEX notification_user ON notifications(user_id,created_at);
CREATE INDEX requests_recipient ON exchange_requests(recipient_id,status);
INSERT INTO skills(id,name,approved) VALUES
 ('skill-ielts','IELTS',1),('skill-english','Ingliz tili',1),('skill-video','Video montaj',1),
 ('skill-design','Grafik dizayn',1),('skill-python','Python',1),('skill-research','Tadqiqot',1);
