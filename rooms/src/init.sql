CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  userId varchar(255),
  title varchar(255),
  about varchar(280),
  createDate DATETIME,
  roomType varchar(255),
  expired boolean
)