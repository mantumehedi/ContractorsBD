
-- SEED DATA FOR CONTRACTORSBD
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure we have 10 projects
INSERT INTO projects (name, status, owner_id)
VALUES 
  ('Rooppur Nuclear Power Plant', 'running', (SELECT id FROM profiles LIMIT 1)),
  ('Matarbari Deep Sea Port', 'running', (SELECT id FROM profiles LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- 2. Assign Site Managers to all projects
-- (Assigning the first available profile as manager for simplicity)
INSERT INTO project_members (project_id, user_id, role)
SELECT p.id, (SELECT id FROM profiles LIMIT 1), 'site_manager'
FROM projects p
ON CONFLICT DO NOTHING;

-- 3. Clean up existing transactions for these projects if you want a fresh start
-- DELETE FROM transactions WHERE project_id IN (SELECT id FROM projects);

-- 4. Generate 20 transactions per project (200 total)
INSERT INTO transactions (project_id, type, amount, category, subcategory, nature, created_at)
SELECT 
  p.id,
  CASE 
    WHEN (i % 5 = 0) THEN 'income' -- 20% Income
    ELSE 'expense'                -- 80% Expense
  END as type,
  CASE 
    WHEN (i % 5 = 0) THEN (random() * 100000 + 50000)::int -- Higher amounts for income
    ELSE (random() * 20000 + 1000)::int                    -- Regular expenses
  END as amount,
  CASE 
    WHEN (i % 4 = 0) THEN 'Material'
    WHEN (i % 4 = 1) THEN 'Labor'
    WHEN (i % 4 = 2) THEN 'Vehicle & Fuel'
    ELSE 'Office'
  END as category,
  CASE 
    WHEN (i % 4 = 0) THEN 'Cement/Steel'
    WHEN (i % 4 = 1) THEN 'Daily Wages'
    WHEN (i % 4 = 2) THEN 'Diesel'
    ELSE 'Stationary'
  END as subcategory,
  CASE 
    WHEN (i % 5 = 0) THEN 'Client Payment'
    WHEN (i % 4 = 0) THEN 'Construction Material'
    WHEN (i % 4 = 1) THEN 'Site Worker Pay'
    WHEN (i % 4 = 2) THEN 'Machine Fuel'
    ELSE 'Office Rent/Exp'
  END || ' #' || i as nature,
  NOW() - (i * interval '12 hours') -- Spread over last 10 days
FROM projects p
CROSS JOIN generate_series(1, 20) AS i;

-- 5. Add translations for any new terms if needed
INSERT INTO translations (key, bn, en)
VALUES 
  ('Client Payment', 'ক্লায়েন্ট পেমেন্ট', 'Client Payment'),
  ('Construction Material', 'নির্মাণ সামগ্রী', 'Construction Material'),
  ('Site Worker Pay', 'শ্রমিক মজুরি', 'Site Worker Pay'),
  ('Machine Fuel', 'মেশিন জ্বালানি', 'Machine Fuel'),
  ('Office Rent/Exp', 'অফিস খরচ', 'Office Rent/Exp')
ON CONFLICT (key) DO NOTHING;
