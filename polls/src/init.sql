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