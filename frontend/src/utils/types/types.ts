export type User = {
  id: string;
  email: string;
  username: string;
};

export type Session = {
  user: User;
};
