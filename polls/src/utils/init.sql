CREATE TABLE rooms (
  id UUID PRIMARY KEY
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  position integer,
  room_id UUID references rooms(id) ON DELETE CASCADE
)