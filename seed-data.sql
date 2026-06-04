-- =============================================================
-- SEED DATA for Banking App
-- Run AFTER the application has started at least once
-- (so that tables + system categories + admin user exist)
-- =============================================================
-- psql -U postgres -d banking -f seed-data.sql
-- =============================================================

-- 1. USERS
-- All passwords: password123 (BCrypt hash)

-- User 1: Michael Chen — active power user, 4 cards, loans, savings
INSERT INTO users (id, email, password_hash, first_name, last_name, active, role, created_at)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000001',
  'm.chen@gmail.com',
  '$2a$10$Fu5seoJOKh9.aGxeggrnd.aXqOJyGYX8Eea1X9Q2p5kUx4lAeZppS',
  'Michael', 'Chen', true, 'USER',
  NOW() - INTERVAL '365 days'
) ON CONFLICT (id) DO NOTHING;

-- User 2: Sarah Mitchell — freelancer, EUR + USD
INSERT INTO users (id, email, password_hash, first_name, last_name, active, role, created_at)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000002',
  'sarah.mitchell@outlook.com',
  '$2a$10$Fu5seoJOKh9.aGxeggrnd.aXqOJyGYX8Eea1X9Q2p5kUx4lAeZppS',
  'Sarah', 'Mitchell', true, 'USER',
  NOW() - INTERVAL '310 days'
) ON CONFLICT (id) DO NOTHING;

-- User 3: James Rodriguez — new user, 1 card
INSERT INTO users (id, email, password_hash, first_name, last_name, active, role, created_at)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000003',
  'j.rodriguez@yahoo.com',
  '$2a$10$Fu5seoJOKh9.aGxeggrnd.aXqOJyGYX8Eea1X9Q2p5kUx4lAeZppS',
  'James', 'Rodriguez', true, 'USER',
  NOW() - INTERVAL '45 days'
) ON CONFLICT (id) DO NOTHING;

-- User 4: Elena Kowalski — premium client, big balances
INSERT INTO users (id, email, password_hash, first_name, last_name, active, role, created_at)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000004',
  'elena.kowalski@proton.me',
  '$2a$10$Fu5seoJOKh9.aGxeggrnd.aXqOJyGYX8Eea1X9Q2p5kUx4lAeZppS',
  'Elena', 'Kowalski', true, 'USER',
  NOW() - INTERVAL '280 days'
) ON CONFLICT (id) DO NOTHING;

-- User 5: David Thompson — deactivated account (for admin demo)
INSERT INTO users (id, email, password_hash, first_name, last_name, active, role, created_at)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000005',
  'd.thompson@icloud.com',
  '$2a$10$Fu5seoJOKh9.aGxeggrnd.aXqOJyGYX8Eea1X9Q2p5kUx4lAeZppS',
  'David', 'Thompson', false, 'USER',
  NOW() - INTERVAL '200 days'
) ON CONFLICT (id) DO NOTHING;

-- User 6: Olivia Nakamura — active, GBP-focused
INSERT INTO users (id, email, password_hash, first_name, last_name, active, role, created_at)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000006',
  'olivia.nakamura@gmail.com',
  '$2a$10$Fu5seoJOKh9.aGxeggrnd.aXqOJyGYX8Eea1X9Q2p5kUx4lAeZppS',
  'Olivia', 'Nakamura', true, 'USER',
  NOW() - INTERVAL '150 days'
) ON CONFLICT (id) DO NOTHING;

-- 2. CARDS (accounts table)
-- Card 1: USD VISA PREMIUM (main card)
INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES (
  'c0000001-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000001',
  12450.75, 'USD', 'ACTIVE', NOW() - INTERVAL '350 days',
  'VISA', 'PREMIUM', '4532 1234 5678 9012', 'PHYSICAL', 5000.00,
  (CURRENT_DATE + INTERVAL '3 years')::date, 'MICHAEL CHEN'
) ON CONFLICT (id) DO NOTHING;

-- Card 2: EUR MASTERCARD DELUXE
INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES (
  'c0000001-0000-4000-8000-000000000002',
  'a1b2c3d4-0000-4000-8000-000000000001',
  8320.50, 'EUR', 'ACTIVE', NOW() - INTERVAL '300 days',
  'MASTERCARD', 'DELUXE', '5312 9876 5432 1098', 'PHYSICAL', 10000.00,
  (CURRENT_DATE + INTERVAL '3 years')::date, 'MICHAEL CHEN'
) ON CONFLICT (id) DO NOTHING;

-- Card 3: GBP VISA STANDARD (virtual)
INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES (
  'c0000001-0000-4000-8000-000000000003',
  'a1b2c3d4-0000-4000-8000-000000000001',
  3150.00, 'GBP', 'ACTIVE', NOW() - INTERVAL '200 days',
  'VISA', 'STANDARD', '4716 5555 4444 3333', 'VIRTUAL', NULL,
  (CURRENT_DATE + INTERVAL '2 years')::date, 'MICHAEL CHEN'
) ON CONFLICT (id) DO NOTHING;

-- Card 4: RUB MASTERCARD STANDARD (blocked for demo)
INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES (
  'c0000001-0000-4000-8000-000000000004',
  'a1b2c3d4-0000-4000-8000-000000000001',
  95000.00, 'RUB', 'BLOCKED', NOW() - INTERVAL '180 days',
  'MASTERCARD', 'STANDARD', '5178 2222 3333 4444', 'PHYSICAL', 50000.00,
  (CURRENT_DATE + INTERVAL '3 years')::date, 'MICHAEL CHEN'
) ON CONFLICT (id) DO NOTHING;


-- 3. TRANSACTIONS for USD card (main, most data)
-- Generates a rich 12-month history with categories for analytics

-- Helper: card IDs
-- USD card: c0000001-0000-4000-8000-000000000001
-- EUR card: c0000001-0000-4000-8000-000000000002
-- GBP card: c0000001-0000-4000-8000-000000000003

-- ===== USD CARD TRANSACTIONS (12 months of data) =====

-- Month 1 (12 months ago) — salary + initial spending
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4500.00, NOW() - INTERVAL '355 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 320.00,  NOW() - INTERVAL '352 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 85.00,   NOW() - INTERVAL '350 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 150.00,  NOW() - INTERVAL '348 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 200.00,  NOW() - INTERVAL '345 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 120.00,  NOW() - INTERVAL '342 days', 'UTILITIES');

-- Month 2
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4500.00, NOW() - INTERVAL '325 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 280.00,  NOW() - INTERVAL '322 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 95.00,   NOW() - INTERVAL '320 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 180.00,  NOW() - INTERVAL '318 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 65.00,   NOW() - INTERVAL '316 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 125.00,  NOW() - INTERVAL '314 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 250.00,  NOW() - INTERVAL '310 days', 'ENTERTAINMENT');

-- Month 3
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4500.00, NOW() - INTERVAL '295 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 800.00,  NOW() - INTERVAL '290 days', 'BONUS'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 350.00,  NOW() - INTERVAL '292 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 110.00,  NOW() - INTERVAL '288 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 200.00,  NOW() - INTERVAL '285 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 300.00,  NOW() - INTERVAL '283 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 130.00,  NOW() - INTERVAL '280 days', 'UTILITIES');

-- Month 4
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4500.00, NOW() - INTERVAL '265 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 290.00,  NOW() - INTERVAL '262 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 75.00,   NOW() - INTERVAL '260 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 160.00,  NOW() - INTERVAL '258 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 450.00,  NOW() - INTERVAL '255 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 90.00,   NOW() - INTERVAL '252 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 130.00,  NOW() - INTERVAL '250 days', 'UTILITIES');

-- Month 5
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4800.00, NOW() - INTERVAL '235 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 310.00,  NOW() - INTERVAL '232 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 100.00,  NOW() - INTERVAL '230 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 220.00,  NOW() - INTERVAL '228 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 170.00,  NOW() - INTERVAL '225 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 500.00,  NOW() - INTERVAL '222 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 135.00,  NOW() - INTERVAL '220 days', 'UTILITIES');

-- Month 6
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4800.00, NOW() - INTERVAL '205 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 1200.00, NOW() - INTERVAL '200 days', 'BONUS'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 340.00,  NOW() - INTERVAL '202 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 120.00,  NOW() - INTERVAL '198 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 190.00,  NOW() - INTERVAL '196 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 380.00,  NOW() - INTERVAL '193 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 140.00,  NOW() - INTERVAL '190 days', 'UTILITIES');

-- Month 7
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 4800.00, NOW() - INTERVAL '175 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 360.00,  NOW() - INTERVAL '172 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 90.00,   NOW() - INTERVAL '170 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 270.00,  NOW() - INTERVAL '168 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 55.00,   NOW() - INTERVAL '165 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 145.00,  NOW() - INTERVAL '162 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 210.00,  NOW() - INTERVAL '160 days', 'RESTAURANT');

-- Month 8
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 5000.00, NOW() - INTERVAL '145 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 330.00,  NOW() - INTERVAL '142 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 105.00,  NOW() - INTERVAL '140 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 600.00,  NOW() - INTERVAL '138 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 175.00,  NOW() - INTERVAL '135 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 150.00,  NOW() - INTERVAL '132 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 300.00,  NOW() - INTERVAL '130 days', 'EDUCATION');

-- Month 9
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 5000.00, NOW() - INTERVAL '115 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 375.00,  NOW() - INTERVAL '112 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 80.00,   NOW() - INTERVAL '110 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 240.00,  NOW() - INTERVAL '108 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 195.00,  NOW() - INTERVAL '105 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 75.00,   NOW() - INTERVAL '102 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 155.00,  NOW() - INTERVAL '100 days', 'UTILITIES');

-- Month 10
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 5000.00, NOW() - INTERVAL '85 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 500.00,  NOW() - INTERVAL '80 days', 'REFUND'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 340.00,  NOW() - INTERVAL '82 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 115.00,  NOW() - INTERVAL '78 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 420.00,  NOW() - INTERVAL '76 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 160.00,  NOW() - INTERVAL '73 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 140.00,  NOW() - INTERVAL '70 days', 'UTILITIES');

-- Month 11
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 5200.00, NOW() - INTERVAL '55 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 310.00,  NOW() - INTERVAL '52 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 95.00,   NOW() - INTERVAL '50 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 280.00,  NOW() - INTERVAL '48 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 185.00,  NOW() - INTERVAL '45 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 350.00,  NOW() - INTERVAL '42 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 145.00,  NOW() - INTERVAL '40 days', 'UTILITIES');

-- Month 12 (current month — dense data for 30d analytics)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 5200.00, NOW() - INTERVAL '28 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 85.50,   NOW() - INTERVAL '27 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 42.00,   NOW() - INTERVAL '26 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 120.00,  NOW() - INTERVAL '25 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 65.00,   NOW() - INTERVAL '24 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 95.00,   NOW() - INTERVAL '22 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 35.00,   NOW() - INTERVAL '21 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 250.00,  NOW() - INTERVAL '20 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 140.00,  NOW() - INTERVAL '18 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 45.00,   NOW() - INTERVAL '17 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 78.00,   NOW() - INTERVAL '15 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 55.00,   NOW() - INTERVAL '14 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 190.00,  NOW() - INTERVAL '12 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 320.00,  NOW() - INTERVAL '10 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 350.00,  NOW() - INTERVAL '9 days',  'REFUND'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 110.00,  NOW() - INTERVAL '8 days',  'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 92.00,   NOW() - INTERVAL '6 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 160.00,  NOW() - INTERVAL '4 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 75.00,   NOW() - INTERVAL '3 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 28.00,   NOW() - INTERVAL '2 days',  'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 50.00,   NOW() - INTERVAL '1 day',   'GROCERIES');


-- ===== EUR CARD TRANSACTIONS =====
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 3800.00, NOW() - INTERVAL '290 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 250.00,  NOW() - INTERVAL '285 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 180.00,  NOW() - INTERVAL '280 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 3800.00, NOW() - INTERVAL '260 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 270.00,  NOW() - INTERVAL '255 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 150.00,  NOW() - INTERVAL '250 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 3800.00, NOW() - INTERVAL '230 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 320.00,  NOW() - INTERVAL '225 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 100.00,  NOW() - INTERVAL '220 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4000.00, NOW() - INTERVAL '200 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 290.00,  NOW() - INTERVAL '195 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 200.00,  NOW() - INTERVAL '190 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4000.00, NOW() - INTERVAL '170 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 350.00,  NOW() - INTERVAL '165 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 85.00,   NOW() - INTERVAL '160 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4000.00, NOW() - INTERVAL '140 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 280.00,  NOW() - INTERVAL '135 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 175.00,  NOW() - INTERVAL '130 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4200.00, NOW() - INTERVAL '110 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 310.00,  NOW() - INTERVAL '105 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 450.00,  NOW() - INTERVAL '100 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4200.00, NOW() - INTERVAL '80 days',  'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 265.00,  NOW() - INTERVAL '75 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 130.00,  NOW() - INTERVAL '70 days',  'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4200.00, NOW() - INTERVAL '50 days',  'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 295.00,  NOW() - INTERVAL '45 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 220.00,  NOW() - INTERVAL '40 days',  'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 4200.00, NOW() - INTERVAL '20 days',  'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 185.00,  NOW() - INTERVAL '15 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 310.00,  NOW() - INTERVAL '10 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 95.00,   NOW() - INTERVAL '5 days',   'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 140.00,  NOW() - INTERVAL '2 days',   'UTILITIES');


-- ===== GBP CARD TRANSACTIONS =====
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2500.00, NOW() - INTERVAL '190 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 180.00,  NOW() - INTERVAL '185 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 95.00,   NOW() - INTERVAL '180 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2500.00, NOW() - INTERVAL '160 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 200.00,  NOW() - INTERVAL '155 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 150.00,  NOW() - INTERVAL '150 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2700.00, NOW() - INTERVAL '130 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 220.00,  NOW() - INTERVAL '125 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 110.00,  NOW() - INTERVAL '120 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2700.00, NOW() - INTERVAL '100 days', 'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 190.00,  NOW() - INTERVAL '95 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 75.00,   NOW() - INTERVAL '90 days',  'HEALTHCARE'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2700.00, NOW() - INTERVAL '70 days',  'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 250.00,  NOW() - INTERVAL '65 days',  'EDUCATION'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 160.00,  NOW() - INTERVAL '60 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2800.00, NOW() - INTERVAL '40 days',  'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 210.00,  NOW() - INTERVAL '35 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 130.00,  NOW() - INTERVAL '30 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'DEPOSIT',  'GBP', 2800.00, NOW() - INTERVAL '10 days',  'SALARY'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 175.00,  NOW() - INTERVAL '7 days',   'GROCERIES'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'WITHDRAW', 'GBP', 85.00,   NOW() - INTERVAL '3 days',   'TRANSPORT');


-- 4. TRANSFERS
INSERT INTO transfers (id, from_account_id, to_account_id, amount, currency, to_credit_amount, to_currency, exchange_rate, created_at) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000002', 1000.00, 'USD', 920.00, 'EUR', 0.92, NOW() - INTERVAL '240 days'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000002', 'c0000001-0000-4000-8000-000000000001', 500.00,  'EUR', 543.48, 'USD', 1.087, NOW() - INTERVAL '180 days'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000003', 800.00,  'USD', 625.00, 'GBP', 0.78125, NOW() - INTERVAL '120 days'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000002', 1500.00, 'USD', 1380.00,'EUR', 0.92, NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000003', 'c0000001-0000-4000-8000-000000000001', 300.00,  'GBP', 384.00, 'USD', 1.28, NOW() - INTERVAL '30 days');

-- NOTE: TransferService does NOT create account_transactions — only updates balances + writes to transfers table


-- 5. LOAN (active)
INSERT INTO loans (id, borrower_id, account_id, principal_amount, annual_interest_rate, term_months,
  monthly_payment, status, start_date, end_date, created_at, updated_at)
VALUES (
  'b0000001-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000001',
  'c0000001-0000-4000-8000-000000000001',
  15000.00, 0.085, 24,
  681.25, 'ACTIVE',
  (CURRENT_DATE - INTERVAL '6 months')::date,
  (CURRENT_DATE + INTERVAL '18 months')::date,
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months'
) ON CONFLICT (id) DO NOTHING;

-- Loan disbursement transaction (LoanService calls deposit() without category)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT', 'USD', 15000.00, NOW() - INTERVAL '6 months', NULL);

-- Repayment schedule (24 months, first 6 paid)
INSERT INTO repayment_schedule (id, loan_id, installment_number, due_date, principal, interest, total_payment, status, paid_at) VALUES
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 1,  (CURRENT_DATE - INTERVAL '5 months')::date, 574.98, 106.27, 681.25, 'PAID', NOW() - INTERVAL '5 months'),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 2,  (CURRENT_DATE - INTERVAL '4 months')::date, 579.05, 102.20, 681.25, 'PAID', NOW() - INTERVAL '4 months'),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 3,  (CURRENT_DATE - INTERVAL '3 months')::date, 583.15, 98.10,  681.25, 'PAID', NOW() - INTERVAL '3 months'),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 4,  (CURRENT_DATE - INTERVAL '2 months')::date, 587.27, 93.98,  681.25, 'PAID', NOW() - INTERVAL '2 months'),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 5,  (CURRENT_DATE - INTERVAL '1 month')::date,  591.42, 89.83,  681.25, 'PAID', NOW() - INTERVAL '1 month'),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 6,  CURRENT_DATE,                                595.60, 85.65,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 7,  (CURRENT_DATE + INTERVAL '1 month')::date,   599.81, 81.44,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 8,  (CURRENT_DATE + INTERVAL '2 months')::date,  604.05, 77.20,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 9,  (CURRENT_DATE + INTERVAL '3 months')::date,  608.32, 72.93,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 10, (CURRENT_DATE + INTERVAL '4 months')::date,  612.62, 68.63,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 11, (CURRENT_DATE + INTERVAL '5 months')::date,  616.96, 64.29,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 12, (CURRENT_DATE + INTERVAL '6 months')::date,  621.33, 59.92,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 13, (CURRENT_DATE + INTERVAL '7 months')::date,  625.73, 55.52,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 14, (CURRENT_DATE + INTERVAL '8 months')::date,  630.16, 51.09,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 15, (CURRENT_DATE + INTERVAL '9 months')::date,  634.62, 46.63,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 16, (CURRENT_DATE + INTERVAL '10 months')::date, 639.12, 42.13,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 17, (CURRENT_DATE + INTERVAL '11 months')::date, 643.65, 37.60,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 18, (CURRENT_DATE + INTERVAL '12 months')::date, 648.21, 33.04,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 19, (CURRENT_DATE + INTERVAL '13 months')::date, 652.80, 28.45,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 20, (CURRENT_DATE + INTERVAL '14 months')::date, 657.43, 23.82,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 21, (CURRENT_DATE + INTERVAL '15 months')::date, 662.09, 19.16,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 22, (CURRENT_DATE + INTERVAL '16 months')::date, 666.79, 14.46,  681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 23, (CURRENT_DATE + INTERVAL '17 months')::date, 671.52, 9.73,   681.25, 'PENDING', NULL),
(gen_random_uuid(), 'b0000001-0000-4000-8000-000000000001', 24, (CURRENT_DATE + INTERVAL '18 months')::date, 676.28, 4.97,   681.25, 'PENDING', NULL);

-- Loan repayment transactions (LoanService calls withdraw() without category)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 681.25, NOW() - INTERVAL '5 months', NULL),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 681.25, NOW() - INTERVAL '4 months', NULL),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 681.25, NOW() - INTERVAL '3 months', NULL),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 681.25, NOW() - INTERVAL '2 months', NULL),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 681.25, NOW() - INTERVAL '1 month',  NULL);

-- Second loan (PENDING — for demo)
INSERT INTO loans (id, borrower_id, account_id, principal_amount, annual_interest_rate, term_months,
  monthly_payment, status, start_date, end_date, created_at, updated_at)
VALUES (
  'b0000001-0000-4000-8000-000000000002',
  'a1b2c3d4-0000-4000-8000-000000000001',
  'c0000001-0000-4000-8000-000000000002',
  5000.00, 0.065, 12,
  NULL, 'PENDING',
  NULL, NULL,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;


-- 6. SAVINGS GOALS
INSERT INTO savings_goals (id, user_id, account_id, name, description, target_amount, current_amount, currency, completed, created_at, updated_at, completed_at) VALUES
(
  gen_random_uuid(),
  'a1b2c3d4-0000-4000-8000-000000000001',
  'c0000001-0000-4000-8000-000000000001',
  'Vacation Fund', 'Summer trip to Italy',
  5000.00, 3200.00, 'USD', false,
  NOW() - INTERVAL '200 days', NOW() - INTERVAL '5 days', NULL
),
(
  gen_random_uuid(),
  'a1b2c3d4-0000-4000-8000-000000000001',
  'c0000001-0000-4000-8000-000000000001',
  'Emergency Fund', 'Rainy day savings',
  10000.00, 10000.00, 'USD', true,
  NOW() - INTERVAL '300 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
),
(
  gen_random_uuid(),
  'a1b2c3d4-0000-4000-8000-000000000001',
  'c0000001-0000-4000-8000-000000000002',
  'New Laptop', 'MacBook Pro M4',
  2500.00, 1800.00, 'EUR', false,
  NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days', NULL
);


-- 7. BUDGETS
-- Need category IDs — use subselect from categories table (system categories seeded by DataInitializer)
INSERT INTO budgets (id, user_id, category_id, period, limit_amount, currency, alert_threshold, start_date, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', c.id, 'MONTHLY', 400.00, 'USD', 0.8,
       (date_trunc('month', CURRENT_DATE))::date, NOW() - INTERVAL '60 days'
FROM categories c WHERE c.code = 'GROCERIES' AND c.is_system = true
ON CONFLICT DO NOTHING;

INSERT INTO budgets (id, user_id, category_id, period, limit_amount, currency, alert_threshold, start_date, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', c.id, 'MONTHLY', 300.00, 'USD', 0.75,
       (date_trunc('month', CURRENT_DATE))::date, NOW() - INTERVAL '60 days'
FROM categories c WHERE c.code = 'RESTAURANT' AND c.is_system = true
ON CONFLICT DO NOTHING;

INSERT INTO budgets (id, user_id, category_id, period, limit_amount, currency, alert_threshold, start_date, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', c.id, 'MONTHLY', 200.00, 'USD', 0.9,
       (date_trunc('month', CURRENT_DATE))::date, NOW() - INTERVAL '60 days'
FROM categories c WHERE c.code = 'ENTERTAINMENT' AND c.is_system = true
ON CONFLICT DO NOTHING;

INSERT INTO budgets (id, user_id, category_id, period, limit_amount, currency, alert_threshold, start_date, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', c.id, 'MONTHLY', 500.00, 'USD', 0.85,
       (date_trunc('month', CURRENT_DATE))::date, NOW() - INTERVAL '30 days'
FROM categories c WHERE c.code = 'SHOPPING' AND c.is_system = true
ON CONFLICT DO NOTHING;

INSERT INTO budgets (id, user_id, category_id, period, limit_amount, currency, alert_threshold, start_date, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', c.id, 'WEEKLY', 50.00, 'USD', 0.8,
       (date_trunc('week', CURRENT_DATE))::date, NOW() - INTERVAL '14 days'
FROM categories c WHERE c.code = 'TRANSPORT' AND c.is_system = true
ON CONFLICT DO NOTHING;


-- 8. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Loan Approved', 'Your loan of $15,000.00 has been approved.', 'LOAN_APPROVED', true, NOW() - INTERVAL '6 months'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Transfer Received', 'You received €920.00 on your EUR card.', 'TRANSFER_RECEIVED', true, NOW() - INTERVAL '240 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Salary Deposited', '$5,200.00 deposited to your USD card.', 'SYSTEM', true, NOW() - INTERVAL '28 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Budget Alert', 'You have spent 80% of your Groceries budget this month.', 'SYSTEM', false, NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Card Blocked', 'Your RUB card ending in 4444 has been blocked.', 'CARD_REQUEST_APPROVED', true, NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Loan Payment Due', 'Your monthly loan payment of $681.25 is due today.', 'LOAN_REPAYMENT', false, NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'New Loan Application', 'Your loan application for €5,000.00 is pending review.', 'SYSTEM', false, NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Savings Goal Progress', 'Your "Vacation Fund" is 64% complete!', 'GOAL_COMPLETED', false, NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Emergency Fund Complete', 'Congratulations! Your "Emergency Fund" goal is complete!', 'GOAL_COMPLETED', true, NOW() - INTERVAL '30 days');


-- 9. BENEFICIARIES
-- Use the admin user ID — get it dynamically
INSERT INTO beneficiaries (id, user_id, nickname, account_number, account_id, bank_name, holder_name, currency, is_favorite, created_at, last_used_at)
SELECT gen_random_uuid(),
       'a1b2c3d4-0000-4000-8000-000000000001',
       'Savings Account (Admin)', u.id::text, NULL,
       'Internal', 'ADMIN USER', 'USD', true,
       NOW() - INTERVAL '100 days', NOW() - INTERVAL '5 days'
FROM users u WHERE u.email = 'admin@bank.local'
ON CONFLICT DO NOTHING;

INSERT INTO beneficiaries (id, user_id, nickname, account_number, account_id, bank_name, holder_name, currency, is_favorite, created_at, last_used_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'My EUR Card', 'c0000001-0000-4000-8000-000000000002', 'c0000001-0000-4000-8000-000000000002', 'Internal', 'MICHAEL CHEN', 'EUR', true, NOW() - INTERVAL '200 days', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'My GBP Card', 'c0000001-0000-4000-8000-000000000003', 'c0000001-0000-4000-8000-000000000003', 'Internal', 'MICHAEL CHEN', 'GBP', false, NOW() - INTERVAL '120 days', NOW() - INTERVAL '30 days');


-- 10. CARD REQUESTS
INSERT INTO card_requests (id, user_id, account_id, request_type, status, created_at, resolved_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000004', 'BLOCK',   'APPROVED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000004', 'UNBLOCK', 'PENDING',  NOW() - INTERVAL '2 days',  NULL);


-- 11. AUDIT LOGS (sample)
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'LOGIN',        'USER',    'a1b2c3d4-0000-4000-8000-000000000001', 'Successful login',           '192.168.1.100', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'CARD_CREATED', 'ACCOUNT', 'c0000001-0000-4000-8000-000000000001', 'VISA PREMIUM USD card',      '192.168.1.100', NOW() - INTERVAL '350 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'CARD_CREATED', 'ACCOUNT', 'c0000001-0000-4000-8000-000000000002', 'MASTERCARD DELUXE EUR card',  '192.168.1.100', NOW() - INTERVAL '300 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'CARD_CREATED', 'ACCOUNT', 'c0000001-0000-4000-8000-000000000003', 'VISA STANDARD GBP virtual',   '192.168.1.100', NOW() - INTERVAL '200 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'TRANSFER',     'TRANSFER', NULL, 'USD 1000 → EUR 920',              '192.168.1.100', NOW() - INTERVAL '240 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'TRANSFER',     'TRANSFER', NULL, 'USD 1500 → EUR 1380',             '192.168.1.100', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'EXCHANGE',     'ACCOUNT', 'c0000001-0000-4000-8000-000000000001', 'GBP 300 → USD 384',          '192.168.1.100', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'CARD_DEPOSIT',  'ACCOUNT', 'c0000001-0000-4000-8000-000000000001', 'Salary $5,200',               '192.168.1.100', NOW() - INTERVAL '28 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'LOGIN',        'USER',    'a1b2c3d4-0000-4000-8000-000000000001', 'Successful login',           '10.0.0.15',     NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'LOGIN',        'USER',    'a1b2c3d4-0000-4000-8000-000000000001', 'Successful login',           '192.168.1.100', NOW() - INTERVAL '6 hours');


-- USER 2: Sarah Mitchell — freelance designer, EUR + USD

-- Sarah's cards
INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES
(
  'c0000002-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000002',
  6780.30, 'EUR', 'ACTIVE', NOW() - INTERVAL '305 days',
  'MASTERCARD', 'PREMIUM', '5234 8901 2345 6789', 'PHYSICAL', 8000.00,
  (CURRENT_DATE + INTERVAL '3 years')::date, 'SARAH MITCHELL'
),
(
  'c0000002-0000-4000-8000-000000000002',
  'a1b2c3d4-0000-4000-8000-000000000002',
  4250.00, 'USD', 'ACTIVE', NOW() - INTERVAL '250 days',
  'VISA', 'STANDARD', '4539 1122 3344 5566', 'VIRTUAL', 3000.00,
  (CURRENT_DATE + INTERVAL '2 years')::date, 'SARAH MITCHELL'
) ON CONFLICT (id) DO NOTHING;

-- Sarah's transactions (EUR card — freelance income + lifestyle)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 3200.00, NOW() - INTERVAL '300 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 180.00,  NOW() - INTERVAL '295 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 350.00,  NOW() - INTERVAL '290 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 90.00,   NOW() - INTERVAL '288 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 2800.00, NOW() - INTERVAL '270 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 210.00,  NOW() - INTERVAL '265 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 145.00,  NOW() - INTERVAL '260 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 280.00,  NOW() - INTERVAL '255 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 4100.00, NOW() - INTERVAL '240 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 600.00,  NOW() - INTERVAL '235 days', 'BONUS'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 195.00,  NOW() - INTERVAL '232 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 420.00,  NOW() - INTERVAL '228 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 3500.00, NOW() - INTERVAL '210 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 165.00,  NOW() - INTERVAL '205 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 75.00,   NOW() - INTERVAL '200 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 310.00,  NOW() - INTERVAL '195 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 3800.00, NOW() - INTERVAL '180 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 240.00,  NOW() - INTERVAL '175 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 155.00,  NOW() - INTERVAL '170 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 3800.00, NOW() - INTERVAL '150 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 190.00,  NOW() - INTERVAL '145 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 370.00,  NOW() - INTERVAL '140 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 120.00,  NOW() - INTERVAL '135 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 4200.00, NOW() - INTERVAL '120 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 205.00,  NOW() - INTERVAL '115 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 95.00,   NOW() - INTERVAL '110 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 4200.00, NOW() - INTERVAL '90 days',  'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 185.00,  NOW() - INTERVAL '85 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 290.00,  NOW() - INTERVAL '80 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 4500.00, NOW() - INTERVAL '60 days',  'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 220.00,  NOW() - INTERVAL '55 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 480.00,  NOW() - INTERVAL '50 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 160.00,  NOW() - INTERVAL '45 days',  'UTILITIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'DEPOSIT',  'EUR', 4500.00, NOW() - INTERVAL '30 days',  'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 175.00,  NOW() - INTERVAL '25 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 130.00,  NOW() - INTERVAL '20 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 65.00,   NOW() - INTERVAL '15 days',  'TRANSPORT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 340.00,  NOW() - INTERVAL '10 days',  'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 200.00,  NOW() - INTERVAL '5 days',   'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'WITHDRAW', 'EUR', 85.00,   NOW() - INTERVAL '2 days',   'HEALTHCARE');

-- Sarah's USD card transactions
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 2000.00, NOW() - INTERVAL '245 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 150.00,  NOW() - INTERVAL '240 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 2500.00, NOW() - INTERVAL '180 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 320.00,  NOW() - INTERVAL '175 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 2500.00, NOW() - INTERVAL '120 days', 'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 180.00,  NOW() - INTERVAL '115 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 3000.00, NOW() - INTERVAL '60 days',  'SALARY'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 250.00,  NOW() - INTERVAL '50 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 85.00,   NOW() - INTERVAL '30 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 190.00,  NOW() - INTERVAL '15 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 120.00,  NOW() - INTERVAL '5 days',   'UTILITIES');

-- Sarah's savings goal
INSERT INTO savings_goals (id, user_id, account_id, name, description, target_amount, current_amount, currency, completed, created_at, updated_at, completed_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'c0000002-0000-4000-8000-000000000001',
 'Studio Equipment', 'New camera + lighting setup', 3000.00, 1450.00, 'EUR', false,
 NOW() - INTERVAL '120 days', NOW() - INTERVAL '8 days', NULL);

-- Sarah's notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'Welcome!', 'Welcome to the banking platform, Sarah!', 'SYSTEM', true, NOW() - INTERVAL '310 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'Salary Deposited', '€4,500.00 deposited to your EUR card.', 'SYSTEM', true, NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'Savings Goal Progress', 'Your "Studio Equipment" is 48% complete!', 'GOAL_COMPLETED', false, NOW() - INTERVAL '8 days');

-- Sarah's audit logs
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'REGISTER',     'USER', 'a1b2c3d4-0000-4000-8000-000000000002', 'New user registration', '85.214.132.47', NOW() - INTERVAL '310 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'CARD_CREATED', 'ACCOUNT', 'c0000002-0000-4000-8000-000000000001', 'MASTERCARD PREMIUM EUR card', '85.214.132.47', NOW() - INTERVAL '305 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'LOGIN',        'USER', 'a1b2c3d4-0000-4000-8000-000000000002', 'Successful login', '85.214.132.47', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'CARD_DEPOSIT',  'ACCOUNT', 'c0000002-0000-4000-8000-000000000001', 'Salary €4,500', '85.214.132.47', NOW() - INTERVAL '30 days');


-- USER 3: James Rodriguez — new user, just getting started

INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES (
  'c0000003-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000003',
  1820.45, 'USD', 'ACTIVE', NOW() - INTERVAL '42 days',
  'VISA', 'STANDARD', '4716 7788 9900 1122', 'PHYSICAL', 2000.00,
  (CURRENT_DATE + INTERVAL '4 years')::date, 'JAMES RODRIGUEZ'
) ON CONFLICT (id) DO NOTHING;

-- James's transactions (short history)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 2500.00, NOW() - INTERVAL '40 days', 'SALARY'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 65.00,   NOW() - INTERVAL '38 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 120.00,  NOW() - INTERVAL '35 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 45.00,   NOW() - INTERVAL '32 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 89.00,   NOW() - INTERVAL '28 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 35.50,   NOW() - INTERVAL '25 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 200.00,  NOW() - INTERVAL '20 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 55.00,   NOW() - INTERVAL '15 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 42.00,   NOW() - INTERVAL '10 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000003-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 28.05,   NOW() - INTERVAL '5 days',  'HEALTHCARE');

-- James's notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000003', 'Welcome!', 'Welcome to the banking platform, James!', 'SYSTEM', true, NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000003', 'First Deposit', 'Your first deposit of $2,500.00 was successful.', 'SYSTEM', true, NOW() - INTERVAL '40 days');

-- James's audit
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000003', 'REGISTER',     'USER', 'a1b2c3d4-0000-4000-8000-000000000003', 'New user registration', '203.0.113.42', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000003', 'CARD_CREATED', 'ACCOUNT', 'c0000003-0000-4000-8000-000000000001', 'VISA STANDARD USD card', '203.0.113.42', NOW() - INTERVAL '42 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000003', 'LOGIN',        'USER', 'a1b2c3d4-0000-4000-8000-000000000003', 'Successful login', '203.0.113.42', NOW() - INTERVAL '1 day');


-- USER 4: Elena Kowalski — premium client, high balances

INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES
(
  'c0000004-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000004',
  47820.00, 'USD', 'ACTIVE', NOW() - INTERVAL '275 days',
  'VISA', 'DELUXE', '4532 6677 8899 0011', 'PHYSICAL', 25000.00,
  (CURRENT_DATE + INTERVAL '4 years')::date, 'ELENA KOWALSKI'
),
(
  'c0000004-0000-4000-8000-000000000002',
  'a1b2c3d4-0000-4000-8000-000000000004',
  22150.75, 'EUR', 'ACTIVE', NOW() - INTERVAL '260 days',
  'MASTERCARD', 'DELUXE', '5412 3344 5566 7788', 'PHYSICAL', 15000.00,
  (CURRENT_DATE + INTERVAL '4 years')::date, 'ELENA KOWALSKI'
),
(
  'c0000004-0000-4000-8000-000000000003',
  'a1b2c3d4-0000-4000-8000-000000000004',
  8900.00, 'GBP', 'ACTIVE', NOW() - INTERVAL '200 days',
  'VISA', 'PREMIUM', '4916 2233 4455 6677', 'VIRTUAL', NULL,
  (CURRENT_DATE + INTERVAL '3 years')::date, 'ELENA KOWALSKI'
) ON CONFLICT (id) DO NOTHING;

-- Elena's USD transactions (high-value, 9 months)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 12000.00, NOW() - INTERVAL '270 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 850.00,   NOW() - INTERVAL '265 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 320.00,   NOW() - INTERVAL '260 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 450.00,   NOW() - INTERVAL '255 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 12000.00, NOW() - INTERVAL '240 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 3000.00,  NOW() - INTERVAL '235 days', 'BONUS'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 1200.00,  NOW() - INTERVAL '230 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 280.00,   NOW() - INTERVAL '225 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 500.00,   NOW() - INTERVAL '220 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 12000.00, NOW() - INTERVAL '210 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 380.00,   NOW() - INTERVAL '205 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 750.00,   NOW() - INTERVAL '200 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 420.00,   NOW() - INTERVAL '195 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 12500.00, NOW() - INTERVAL '180 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 920.00,   NOW() - INTERVAL '175 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 160.00,   NOW() - INTERVAL '170 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 290.00,   NOW() - INTERVAL '165 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 12500.00, NOW() - INTERVAL '150 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 410.00,   NOW() - INTERVAL '145 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 650.00,   NOW() - INTERVAL '140 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 180.00,   NOW() - INTERVAL '135 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 12500.00, NOW() - INTERVAL '120 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 1500.00,  NOW() - INTERVAL '115 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 350.00,   NOW() - INTERVAL '110 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 13000.00, NOW() - INTERVAL '90 days',  'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 470.00,   NOW() - INTERVAL '85 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 800.00,   NOW() - INTERVAL '80 days',  'EDUCATION'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 300.00,   NOW() - INTERVAL '75 days',  'UTILITIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 13000.00, NOW() - INTERVAL '60 days',  'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 5000.00,  NOW() - INTERVAL '55 days',  'BONUS'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 2200.00,  NOW() - INTERVAL '50 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 380.00,   NOW() - INTERVAL '45 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 520.00,   NOW() - INTERVAL '40 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 13000.00, NOW() - INTERVAL '30 days',  'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 450.00,   NOW() - INTERVAL '25 days',  'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 290.00,   NOW() - INTERVAL '20 days',  'TRANSPORT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 680.00,   NOW() - INTERVAL '15 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 350.00,   NOW() - INTERVAL '10 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 1100.00,  NOW() - INTERVAL '5 days',   'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 200.00,   NOW() - INTERVAL '2 days',   'HEALTHCARE');

-- Elena's EUR card transactions
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 8000.00, NOW() - INTERVAL '255 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 450.00,  NOW() - INTERVAL '250 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 280.00,  NOW() - INTERVAL '245 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 8000.00, NOW() - INTERVAL '225 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 520.00,  NOW() - INTERVAL '220 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 310.00,  NOW() - INTERVAL '215 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 8500.00, NOW() - INTERVAL '195 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 700.00,  NOW() - INTERVAL '190 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 8500.00, NOW() - INTERVAL '165 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 380.00,  NOW() - INTERVAL '160 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 250.00,  NOW() - INTERVAL '155 days', 'UTILITIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 9000.00, NOW() - INTERVAL '135 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 900.00,  NOW() - INTERVAL '130 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 9000.00, NOW() - INTERVAL '105 days', 'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 420.00,  NOW() - INTERVAL '100 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 350.00,  NOW() - INTERVAL '95 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 9000.00, NOW() - INTERVAL '75 days',  'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 600.00,  NOW() - INTERVAL '70 days',  'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 9500.00, NOW() - INTERVAL '45 days',  'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 480.00,  NOW() - INTERVAL '40 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 290.00,  NOW() - INTERVAL '35 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'DEPOSIT',  'EUR', 9500.00, NOW() - INTERVAL '15 days',  'SALARY'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 550.00,  NOW() - INTERVAL '10 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000002', 'WITHDRAW', 'EUR', 320.00,  NOW() - INTERVAL '5 days',   'UTILITIES');

-- Elena's loan (active, big)
INSERT INTO loans (id, borrower_id, account_id, principal_amount, annual_interest_rate, term_months,
  monthly_payment, status, start_date, end_date, created_at, updated_at)
VALUES (
  'b0000004-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000004',
  'c0000004-0000-4000-8000-000000000001',
  50000.00, 0.072, 36,
  1548.20, 'ACTIVE',
  (CURRENT_DATE - INTERVAL '4 months')::date,
  (CURRENT_DATE + INTERVAL '32 months')::date,
  NOW() - INTERVAL '4 months',
  NOW() - INTERVAL '4 months'
) ON CONFLICT (id) DO NOTHING;

-- Elena's repayment schedule (first 4 of 36)
INSERT INTO repayment_schedule (id, loan_id, installment_number, due_date, principal, interest, total_payment, status, paid_at) VALUES
(gen_random_uuid(), 'b0000004-0000-4000-8000-000000000001', 1,  (CURRENT_DATE - INTERVAL '3 months')::date, 1248.20, 300.00, 1548.20, 'PAID', NOW() - INTERVAL '3 months'),
(gen_random_uuid(), 'b0000004-0000-4000-8000-000000000001', 2,  (CURRENT_DATE - INTERVAL '2 months')::date, 1255.69, 292.51, 1548.20, 'PAID', NOW() - INTERVAL '2 months'),
(gen_random_uuid(), 'b0000004-0000-4000-8000-000000000001', 3,  (CURRENT_DATE - INTERVAL '1 month')::date,  1263.22, 284.98, 1548.20, 'PAID', NOW() - INTERVAL '1 month'),
(gen_random_uuid(), 'b0000004-0000-4000-8000-000000000001', 4,  CURRENT_DATE,                                1270.79, 277.41, 1548.20, 'PENDING', NULL),
(gen_random_uuid(), 'b0000004-0000-4000-8000-000000000001', 5,  (CURRENT_DATE + INTERVAL '1 month')::date,   1278.40, 269.80, 1548.20, 'PENDING', NULL),
(gen_random_uuid(), 'b0000004-0000-4000-8000-000000000001', 6,  (CURRENT_DATE + INTERVAL '2 months')::date,  1286.06, 262.14, 1548.20, 'PENDING', NULL);

-- Elena's loan transactions (LoanService calls deposit/withdraw without category)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 50000.00, NOW() - INTERVAL '4 months', NULL),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 1548.20,  NOW() - INTERVAL '3 months', NULL),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 1548.20,  NOW() - INTERVAL '2 months', NULL),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 1548.20,  NOW() - INTERVAL '1 month',  NULL);

-- Elena's transfers
INSERT INTO transfers (id, from_account_id, to_account_id, amount, currency, to_credit_amount, to_currency, exchange_rate, created_at) VALUES
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'c0000004-0000-4000-8000-000000000002', 5000.00, 'USD', 4600.00, 'EUR', 0.92, NOW() - INTERVAL '150 days'),
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'c0000004-0000-4000-8000-000000000003', 3000.00, 'USD', 2340.00, 'GBP', 0.78, NOW() - INTERVAL '90 days');

-- NOTE: Elena's transfers don't create account_transactions (TransferService only updates balances)

-- Elena's savings goals
INSERT INTO savings_goals (id, user_id, account_id, name, description, target_amount, current_amount, currency, completed, created_at, updated_at, completed_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'c0000004-0000-4000-8000-000000000001',
 'Investment Fund', 'Stock market starting capital', 25000.00, 18500.00, 'USD', false,
 NOW() - INTERVAL '250 days', NOW() - INTERVAL '3 days', NULL),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'c0000004-0000-4000-8000-000000000002',
 'Paris Apartment', 'Down payment fund', 50000.00, 12000.00, 'EUR', false,
 NOW() - INTERVAL '200 days', NOW() - INTERVAL '15 days', NULL);

-- Elena's notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'Loan Approved', 'Your loan of $50,000.00 has been approved.', 'LOAN_APPROVED', true, NOW() - INTERVAL '4 months'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'Large Transfer', 'Transfer of $5,000.00 to your EUR card completed.', 'TRANSFER_RECEIVED', true, NOW() - INTERVAL '150 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'Loan Payment Due', 'Your monthly payment of $1,548.20 is due today.', 'LOAN_REPAYMENT', false, NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'Salary Deposited', '$13,000.00 deposited to your USD card.', 'SYSTEM', true, NOW() - INTERVAL '30 days');

-- Elena's audit
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'REGISTER',     'USER', 'a1b2c3d4-0000-4000-8000-000000000004', 'New user registration', '91.108.22.156', NOW() - INTERVAL '280 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'CARD_CREATED', 'ACCOUNT', 'c0000004-0000-4000-8000-000000000001', 'VISA DELUXE USD card', '91.108.22.156', NOW() - INTERVAL '275 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'CARD_CREATED', 'ACCOUNT', 'c0000004-0000-4000-8000-000000000002', 'MASTERCARD DELUXE EUR card', '91.108.22.156', NOW() - INTERVAL '260 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'TRANSFER',     'TRANSFER', NULL, 'USD 5000 → EUR 4600', '91.108.22.156', NOW() - INTERVAL '150 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'LOGIN',        'USER', 'a1b2c3d4-0000-4000-8000-000000000004', 'Successful login', '91.108.22.156', NOW() - INTERVAL '4 hours');


-- USER 5: David Thompson — deactivated user (minimal data)

INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES (
  'c0000005-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000005',
  0.00, 'USD', 'CLOSED', NOW() - INTERVAL '195 days',
  'VISA', 'STANDARD', '4539 9988 7766 5544', 'PHYSICAL', NULL,
  (CURRENT_DATE + INTERVAL '3 years')::date, 'DAVID THOMPSON'
) ON CONFLICT (id) DO NOTHING;

-- David's few transactions before closing
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000005-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 1000.00, NOW() - INTERVAL '190 days', 'SALARY'),
(gen_random_uuid(), 'c0000005-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 250.00,  NOW() - INTERVAL '185 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000005-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 150.00,  NOW() - INTERVAL '180 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000005-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 600.00,  NOW() - INTERVAL '170 days', 'OTHER');

-- David's audit (register + deactivation)
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000005', 'REGISTER', 'USER', 'a1b2c3d4-0000-4000-8000-000000000005', 'New user registration', '172.16.254.1', NOW() - INTERVAL '200 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000005', 'LOGIN',    'USER', 'a1b2c3d4-0000-4000-8000-000000000005', 'Successful login', '172.16.254.1', NOW() - INTERVAL '165 days');


-- USER 6: Olivia Nakamura — GBP-focused, active

INSERT INTO accounts (id, owner_id, balance, currency, status, created_at,
  card_network, card_tier, card_number, card_type, daily_limit, expiry_date, holder_name)
VALUES
(
  'c0000006-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000006',
  11420.80, 'GBP', 'ACTIVE', NOW() - INTERVAL '145 days',
  'VISA', 'PREMIUM', '4929 1357 2468 0000', 'PHYSICAL', 5000.00,
  (CURRENT_DATE + INTERVAL '4 years')::date, 'OLIVIA NAKAMURA'
),
(
  'c0000006-0000-4000-8000-000000000002',
  'a1b2c3d4-0000-4000-8000-000000000006',
  2900.00, 'USD', 'ACTIVE', NOW() - INTERVAL '100 days',
  'MASTERCARD', 'STANDARD', '5178 4321 8765 9999', 'VIRTUAL', 2000.00,
  (CURRENT_DATE + INTERVAL '2 years')::date, 'OLIVIA NAKAMURA'
) ON CONFLICT (id) DO NOTHING;

-- Olivia's GBP card transactions (5 months)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'DEPOSIT',  'GBP', 5500.00, NOW() - INTERVAL '140 days', 'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 280.00,  NOW() - INTERVAL '135 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 150.00,  NOW() - INTERVAL '130 days', 'TRANSPORT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 320.00,  NOW() - INTERVAL '125 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 95.00,   NOW() - INTERVAL '120 days', 'HEALTHCARE'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'DEPOSIT',  'GBP', 5500.00, NOW() - INTERVAL '110 days', 'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 310.00,  NOW() - INTERVAL '105 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 450.00,  NOW() - INTERVAL '100 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 180.00,  NOW() - INTERVAL '95 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 130.00,  NOW() - INTERVAL '90 days',  'UTILITIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'DEPOSIT',  'GBP', 5800.00, NOW() - INTERVAL '80 days',  'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 260.00,  NOW() - INTERVAL '75 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 190.00,  NOW() - INTERVAL '70 days',  'RESTAURANT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 500.00,  NOW() - INTERVAL '65 days',  'EDUCATION'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'DEPOSIT',  'GBP', 5800.00, NOW() - INTERVAL '50 days',  'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'DEPOSIT',  'GBP', 1200.00, NOW() - INTERVAL '45 days',  'BONUS'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 340.00,  NOW() - INTERVAL '42 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 220.00,  NOW() - INTERVAL '38 days',  'SHOPPING'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 85.00,   NOW() - INTERVAL '35 days',  'TRANSPORT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'DEPOSIT',  'GBP', 5800.00, NOW() - INTERVAL '20 days',  'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 290.00,  NOW() - INTERVAL '15 days',  'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 175.00,  NOW() - INTERVAL '10 days',  'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 410.00,  NOW() - INTERVAL '7 days',   'RESTAURANT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 65.00,   NOW() - INTERVAL '3 days',   'HEALTHCARE'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000001', 'WITHDRAW', 'GBP', 130.00,  NOW() - INTERVAL '1 day',    'UTILITIES');

-- Olivia's USD card transactions
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 3000.00, NOW() - INTERVAL '95 days', 'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 180.00,  NOW() - INTERVAL '90 days', 'ENTERTAINMENT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 120.00,  NOW() - INTERVAL '80 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 3000.00, NOW() - INTERVAL '65 days', 'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 250.00,  NOW() - INTERVAL '55 days', 'SHOPPING'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 95.00,   NOW() - INTERVAL '40 days', 'RESTAURANT'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 3000.00, NOW() - INTERVAL '35 days', 'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 310.00,  NOW() - INTERVAL '25 days', 'EDUCATION'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 145.00,  NOW() - INTERVAL '15 days', 'GROCERIES'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'DEPOSIT',  'USD', 3000.00, NOW() - INTERVAL '5 days',  'SALARY'),
(gen_random_uuid(), 'c0000006-0000-4000-8000-000000000002', 'WITHDRAW', 'USD', 200.00,  NOW() - INTERVAL '2 days',  'SHOPPING');

-- Olivia's loan (pending)
INSERT INTO loans (id, borrower_id, account_id, principal_amount, annual_interest_rate, term_months,
  monthly_payment, status, start_date, end_date, created_at, updated_at)
VALUES (
  'b0000006-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000006',
  'c0000006-0000-4000-8000-000000000001',
  8000.00, 0.079, 18,
  NULL, 'PENDING',
  NULL, NULL,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Olivia's savings goals
INSERT INTO savings_goals (id, user_id, account_id, name, description, target_amount, current_amount, currency, completed, created_at, updated_at, completed_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'c0000006-0000-4000-8000-000000000001',
 'Wedding Fund', 'Ceremony and reception', 15000.00, 6800.00, 'GBP', false,
 NOW() - INTERVAL '130 days', NOW() - INTERVAL '7 days', NULL),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'c0000006-0000-4000-8000-000000000002',
 'New Car', 'Down payment for a hybrid', 8000.00, 2400.00, 'USD', false,
 NOW() - INTERVAL '80 days', NOW() - INTERVAL '12 days', NULL);

-- Olivia's notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'Welcome!', 'Welcome to the banking platform, Olivia!', 'SYSTEM', true, NOW() - INTERVAL '150 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'Salary Deposited', '£5,800.00 deposited to your GBP card.', 'SYSTEM', true, NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'Loan Application', 'Your loan application for £8,000.00 is pending review.', 'SYSTEM', false, NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'Bonus Received', '£1,200.00 bonus deposited!', 'TRANSFER_RECEIVED', true, NOW() - INTERVAL '45 days');

-- Olivia's beneficiaries
INSERT INTO beneficiaries (id, user_id, nickname, account_number, account_id, bank_name, holder_name, currency, is_favorite, created_at, last_used_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'My USD Card', 'c0000006-0000-4000-8000-000000000002', 'c0000006-0000-4000-8000-000000000002', 'Internal', 'OLIVIA NAKAMURA', 'USD', true, NOW() - INTERVAL '100 days', NOW() - INTERVAL '10 days');

-- Olivia's audit
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'REGISTER',     'USER', 'a1b2c3d4-0000-4000-8000-000000000006', 'New user registration', '51.15.183.200', NOW() - INTERVAL '150 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'CARD_CREATED', 'ACCOUNT', 'c0000006-0000-4000-8000-000000000001', 'VISA PREMIUM GBP card', '51.15.183.200', NOW() - INTERVAL '145 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'CARD_CREATED', 'ACCOUNT', 'c0000006-0000-4000-8000-000000000002', 'MASTERCARD STANDARD USD virtual', '51.15.183.200', NOW() - INTERVAL '100 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'CARD_DEPOSIT',  'ACCOUNT', 'c0000006-0000-4000-8000-000000000001', 'Salary £5,800', '51.15.183.200', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000006', 'LOGIN',        'USER', 'a1b2c3d4-0000-4000-8000-000000000006', 'Successful login', '51.15.183.200', NOW() - INTERVAL '2 hours');


-- Cross-user transfers (makes it feel like a real bank)

-- Michael → Sarah (USD to USD)
INSERT INTO transfers (id, from_account_id, to_account_id, amount, currency, to_credit_amount, to_currency, exchange_rate, created_at) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'c0000002-0000-4000-8000-000000000002', 500.00, 'USD', 500.00, 'USD', 1.0, NOW() - INTERVAL '90 days');

-- NOTE: TransferService does NOT create account_transactions, only transfer records + balance updates

-- Elena → Olivia (USD to GBP)
INSERT INTO transfers (id, from_account_id, to_account_id, amount, currency, to_credit_amount, to_currency, exchange_rate, created_at) VALUES
(gen_random_uuid(), 'c0000004-0000-4000-8000-000000000001', 'c0000006-0000-4000-8000-000000000001', 2000.00, 'USD', 1560.00, 'GBP', 0.78, NOW() - INTERVAL '45 days');

-- Sarah → Michael (EUR to EUR)
INSERT INTO transfers (id, from_account_id, to_account_id, amount, currency, to_credit_amount, to_currency, exchange_rate, created_at) VALUES
(gen_random_uuid(), 'c0000002-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000002', 300.00, 'EUR', 300.00, 'EUR', 1.0, NOW() - INTERVAL '30 days');


-- Cross-user beneficiaries

INSERT INTO beneficiaries (id, user_id, nickname, account_number, account_id, bank_name, holder_name, currency, is_favorite, created_at, last_used_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000002', 'Michael C.', 'c0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'Internal', 'MICHAEL CHEN', 'USD', false, NOW() - INTERVAL '95 days', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000004', 'Olivia N.', 'c0000006-0000-4000-8000-000000000001', 'c0000006-0000-4000-8000-000000000001', 'Internal', 'OLIVIA NAKAMURA', 'GBP', true, NOW() - INTERVAL '50 days', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'a1b2c3d4-0000-4000-8000-000000000001', 'Sarah M.', 'c0000002-0000-4000-8000-000000000002', 'c0000002-0000-4000-8000-000000000002', 'Internal', 'SARAH MITCHELL', 'USD', false, NOW() - INTERVAL '95 days', NOW() - INTERVAL '90 days');


-- Large purchase + refund (creates a visible dip on the dashboard chart)
INSERT INTO account_transactions (id, account_id, type, currency, amount, created_at, category) VALUES
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'WITHDRAW', 'USD', 53000.00, '2025-12-15T12:00:00Z', 'SHOPPING'),
(gen_random_uuid(), 'c0000001-0000-4000-8000-000000000001', 'DEPOSIT',  'USD', 53000.00, '2026-01-10T12:00:00Z', 'REFUND');

-- RECALCULATE BALANCES from actual transactions
-- (hardcoded balances in INSERT don't match transaction sums)
UPDATE accounts a
SET balance = (
  SELECT COALESCE(SUM(
    CASE WHEN t.type IN ('DEPOSIT', 'EXCHANGE_IN') THEN t.amount
         ELSE -t.amount END
  ), 0)
  FROM account_transactions t
  WHERE t.account_id = a.id
);

-- DONE.
-- Logins (all password: password123):
--   m.chen@gmail.com        — Michael Chen (power user, 4 cards, loans, savings)
--   sarah.mitchell@outlook.com — Sarah Mitchell (freelancer, EUR + USD)
--   j.rodriguez@yahoo.com   — James Rodriguez (new user, 1 card)
--   elena.kowalski@proton.me — Elena Kowalski (premium, big balances, $50k loan)
--   d.thompson@icloud.com   — David Thompson (deactivated, closed card)
--   olivia.nakamura@gmail.com — Olivia Nakamura (GBP-focused, pending loan)
--   admin@bank.local / admin123 — Admin (created by DataInitializer)
