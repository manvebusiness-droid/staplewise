/*
  # Add DELETE policy for orders table

  1. Security Changes
    - Add RLS policy to allow DELETE operations on orders table
    - Allow authenticated users to delete orders (admin functionality)

  This fixes the "No rows were deleted - RLS policy blocking deletion" error.
*/

-- Add DELETE policy for orders table
CREATE POLICY "Allow order deletion" 
  ON orders FOR DELETE 
  TO authenticated 
  USING (true);