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

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  votes integer default 0,
  createDate TIMESTAMP default current_timestamp,
  roomId text,
  banned boolean default false
)