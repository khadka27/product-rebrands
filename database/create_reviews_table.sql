-- Create reviews table for PostgreSQL
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Create index for product_id
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on reviews table
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample reviews (optional)
INSERT INTO reviews (product_id, name, address, rating, review_text) VALUES
('sample-product-id', 'Michael R.', '42, New York, NY', 5, 'I''ve been using this product for 3 weeks, and the results are amazing! It gave me the energy and confidence I needed. My workouts are more productive and I feel stronger than ever.'),
('sample-product-id', 'David T.', '38, Los Angeles, CA', 5, 'I''m amazed by how quickly I felt the difference. My workouts are better, and my energy levels have skyrocketed! I''ve tried other supplements before, but nothing compares to this product.'),
('sample-product-id', 'James K.', '45, Chicago, IL', 4, 'After trying several products, this is the only one that delivered real results. Highly recommended! I''ve noticed significant improvements in just two weeks of use.')
ON CONFLICT DO NOTHING;