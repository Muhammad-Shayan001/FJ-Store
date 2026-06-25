-- FJ Store Checkout Addition (Phase 7)
-- NOTE: Due to PostgreSQL restrictions, adding a new enum value and using it 
-- must happen in separate transactions.

-- ==========================================
-- STEP 1: EXECUTE THIS LINE BY ITSELF FIRST
-- ==========================================
ALTER TYPE discount_type ADD VALUE IF NOT EXISTS 'free_shipping';
COMMIT;

-- ==========================================
-- STEP 2: EXECUTE THE REST AFTER STEP 1
-- ==========================================
-- Insert dummy coupons for testing (optional but helpful)
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES 
  ('SUMMER20', 'percentage', 20.00, 50.00, true),
  ('FLAT10', 'fixed', 10.00, 30.00, true),
  ('FREESHIP', 'free_shipping', 0, 0, true)
ON CONFLICT (code) DO NOTHING;
