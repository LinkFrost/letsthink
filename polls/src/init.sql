CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  userId text,
  title text,
  about text,
  createDate TIMESTAMP,
  duration integer,
  roomType text,
  expired boolean default false
);

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roomId text
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  optionNumber integer,
  votes integer default 0,
  pollId UUID references polls(id)
);