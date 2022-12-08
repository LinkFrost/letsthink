CREATE TABLE rooms (
  id UUID PRIMARY KEY
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  content text
);