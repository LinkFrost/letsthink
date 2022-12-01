CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId text,
  title text,
  about text,
  createDate DATETIME,
  roomType text,
  expired boolean
)