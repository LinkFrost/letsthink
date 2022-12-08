CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  password text not null
);