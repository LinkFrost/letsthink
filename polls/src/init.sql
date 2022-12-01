CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId text,
  title text,
  about text,
  createDate TIMESTAMP default current_timestamp,
  duration integer,
  roomType text,
  expired boolean
);

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roomId text
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  votes integer default 0,
  pollId text references polls(id)
);