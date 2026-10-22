-- First-run onboarding marker. Existing users who already filled their profile are treated as onboarded.
ALTER TABLE profiles ADD COLUMN onboarded_at TEXT;
UPDATE profiles SET onboarded_at=CURRENT_TIMESTAMP WHERE faculty<>'' OR bio<>'' OR user_id IN (SELECT user_id FROM user_skills);
