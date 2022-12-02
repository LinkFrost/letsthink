CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId text,
  title text,
  about text,
  createDate TIMESTAMP default current_timestamp,
  duration integer,
  roomType text
)