CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  title TEXT,
  about TEXT,
  room_type TEXT,
  duration INTEGER,
  create_date TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('minute', current_timestamp(0))
);