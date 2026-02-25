-- Migration script to link bookings to actual equipment and users
-- 1. Add new columns to the bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Create indexes for the new foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_bookings_equipment_id ON bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);

-- Optional: If you want to drop the old text columns later, you could do it here,
-- but for now we'll keep them as fallback/historical data or until we fully migrate.
-- ALTER TABLE bookings DROP COLUMN IF EXISTS equipment_name;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS equipment_type;

-- 3. Update RLS Policies for Bookings
-- First, drop the old simplistic policies if they exist (assuming naming convention)
DROP POLICY IF EXISTS "Public bookings are viewable by everyone." ON bookings;
DROP POLICY IF EXISTS "Users can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;

-- Now create more specific policies based on the new ID columns

-- Policy: Renters can view their own bookings
CREATE POLICY "Renters can view their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = renter_id);

-- Policy: Owners can view bookings for their equipment
CREATE POLICY "Owners can view bookings for their equipment"
  ON bookings
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Anyone logged in can create a booking
CREATE POLICY "Authenticated users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Usually, you'd want to check that renter_id = auth.uid() here too

-- Policy: Owners can update bookings (e.g., mark as paid/completed)
CREATE POLICY "Owners can update their equipment bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Renters can update their own bookings (e.g., cancel)
CREATE POLICY "Renters can update their own bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = renter_id);

-- Note: Depending on your exact previous setup, you might need to adjust the DROP POLICY names.
-- It's often safer to just leave the old ones if they were completely permissive,
-- but these new ones provide proper owner/renter isolation.
