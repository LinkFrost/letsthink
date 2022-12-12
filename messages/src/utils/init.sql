CREATE TABLE rooms (
  id UUID PRIMARY KEY
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  content text,
  create_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
);