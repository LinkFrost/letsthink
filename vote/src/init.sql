CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId text,
  title text,
  about text,
  createDate TIMESTAMP WITH TIME ZONE default CURRENT_TIMESTAMP,
  duration integer,
  roomType text
)