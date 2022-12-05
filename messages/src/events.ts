interface Event {
  key: EventKeys;
}

export type EventKeys =
  | "RoomCreated"
  | "RoomExpired"
  | "RoomVisualized"
  | "MessageCreated"
  | "MessageVoted"
  | "MessageModerated"
  | "PollCreated"
  | "PollVoted"
  | "UserCreated"
  | "HTTPRequest";

export interface RoomCreated extends Event {
  key: "RoomCreated";
  data: {
    id: string;
    userId: string;
    title: string;
    about: string;
    createDate: string;
    duration: number;
    roomType: "message" | "poll";
  };
}

export interface RoomData {
  id: string;
  userId: string;
  title: string;
  about: string;
  createdate: string;
  duration: number;
  roomType: string;
  expired: boolean;
}

export interface MessageCreated extends Event {
  key: "MessageCreated";
  data: {
    id: string;
    room_id: string;
    content: string;
  };
}
