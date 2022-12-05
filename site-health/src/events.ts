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

export interface RoomExpired extends Event {
  key: "RoomExpired";
  data: {
    roomId: string;
    expiredData: string;
  };
}

export interface MessageModerated extends Event {
  key: "MessageModerated";
  data: {
    userId: string;
    roomId: string;
    content: string;
    moderated: "pending" | "accepted" | "rejected";
  };
}

export interface UserCreated extends Event {
  key: "UserCreated";
  data: {
    id: string;
    email: string;
    username: string;
    password: string;
  };
}

export interface PollVoted extends Event {
  key: "PollVoted";
  data: {
    pollId: string;
    roomId: string;
    option: string;
  };
}

export interface MessageVoted extends Event {
  key: "MessageVoted";
  data: {
    messageId: string;
    roomId: string;
    vote: number;
  };
}

export interface MessageCreated extends Event {
  key: "MessageCreated";
  data: {
    userId: string;
    roomId: string;
    content: string;
  };
}

export interface HTTPRequest extends Event {
  key: "HTTPRequest";
  data: {
    status: number;
  };
}
