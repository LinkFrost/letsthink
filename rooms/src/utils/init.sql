CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  title text,
  about text,
  create_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  duration integer,
  room_type text
)