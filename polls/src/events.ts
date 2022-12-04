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
  userid: string;
  title: string;
  about: string;
  createdate: string;
  duration: number;
  roomtype: string;
  expired: boolean;
}

export interface MessageCreated extends Event {
  key: "MessageCreated";
  data: {
    roomId: string;
    content: string;
  };
}

export interface PollCreated extends Event {
  key: "PollCreated";
  data: {
    id: string;
    roomId: string;
    pollOptions: PollOptions[];
  };
}

export interface PollData {
  id: string;
  roomid: string;
}

export interface PollOptions {
  id: string;
  title: string;
  optionnumber: number;
  votes: number;
  pollid: string;
}
