PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE COLLATE NOCASE,
  username          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash     TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  phone             TEXT,
  is_hsu_student    INTEGER NOT NULL DEFAULT 0,
  programme         TEXT,
  year_of_entrance  INTEGER,
  student_id        TEXT,
  roles             TEXT NOT NULL DEFAULT '["student"]',
  wallet_balance    REAL NOT NULL DEFAULT 0,
  loyalty_stamps    INTEGER NOT NULL DEFAULT 0,
  avatar_url        TEXT,
  created_at        TEXT NOT NULL,
  last_login        TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id                  INTEGER PRIMARY KEY,
  category            TEXT NOT NULL,
  name_en             TEXT NOT NULL,
  name_zh             TEXT NOT NULL,
  price               REAL NOT NULL,
  stock               INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 4,
  image_url           TEXT,
  is_merch            INTEGER NOT NULL DEFAULT 0,
  pickup_only         INTEGER NOT NULL DEFAULT 0,
  selector            TEXT,
  details_en          TEXT,
  details_zh          TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_slots (
  id            TEXT PRIMARY KEY,
  slot_date     TEXT NOT NULL,
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  location      TEXT NOT NULL,
  capacity      INTEGER NOT NULL,
  booked        INTEGER NOT NULL DEFAULT 0,
  enabled       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL,
  payment_method  TEXT NOT NULL,
  payment_status  TEXT NOT NULL,
  slot_id         TEXT REFERENCES time_slots(id),
  slot_time       TEXT,
  location        TEXT,
  total           REAL NOT NULL,
  pickup_code_hash TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  ready_at        TEXT,
  collected_at    TEXT,
  cancelled_at    TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL,
  quantity    INTEGER NOT NULL,
  unit_price  REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  kind       TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_zh TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT,
  action     TEXT NOT NULL,
  meta       TEXT,
  ip         TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, product_id)
);