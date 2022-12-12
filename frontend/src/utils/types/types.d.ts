export type User = {
  id: string;
  email: string;
  username: string;
};

type SubmissionStatus = {
  color: "red" | "emerald" | "";
  message: string;
  status: "error" | "success" | "";
};

export interface PollOptionType {
  id: string;
  title: string;
  votes: number;
  room_id: string;
  position: number;
}

export interface PollOptionColor {
  color: string;
  hover: string;
  selected: string;
  border: string;
  inactive: string;
}

export interface MessageType {
  id: string;
  content: string;
  create_date: string;
  room_id: string;
  votes: number;
}

export interface RoomDataType {
  expired: boolean;
  id: string;
  user_id: string;
  title: string;
  about: string;
  room_type: "message" | "poll";
  duration: number;
  create_date: string;
  expire_date: string;
  poll_options?: PollOptionType[];
  messages?: MessageType[];
}
