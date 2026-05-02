-- SOLUTION 2: DB SCHEMA DENORMALIZATION
-- Run this in your Supabase SQL Editor

-- 1. Update Projects Table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name_bn TEXT;

-- 2. Update Transactions Table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS nature_en TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS nature_bn TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category_en TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category_bn TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subcategory_en TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subcategory_bn TEXT;

-- 3. Update Vendors/Payees Table (Optional but recommended)
ALTER TABLE vendors_payees ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE vendors_payees ADD COLUMN IF NOT EXISTS name_bn TEXT;

-- 4. Data Migration (Optional: Copy current names to name_en as a starting point)
UPDATE projects SET name_en = name WHERE name_en IS NULL;
UPDATE transactions SET nature_en = nature WHERE nature_en IS NULL;
UPDATE transactions SET category_en = category WHERE category_en IS NULL;
UPDATE transactions SET subcategory_en = subcategory WHERE subcategory_en IS NULL;
UPDATE vendors_payees SET name_en = name WHERE name_en IS NULL;
