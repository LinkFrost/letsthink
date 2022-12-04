CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId text
);