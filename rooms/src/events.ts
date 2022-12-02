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
