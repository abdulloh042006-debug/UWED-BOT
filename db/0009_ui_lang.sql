-- Preferred interface language (uz, ru, en). NULL = not chosen yet (client detects from Telegram).
ALTER TABLE profiles ADD COLUMN ui_lang TEXT;
