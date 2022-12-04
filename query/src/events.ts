interface Event {
  key: EventKeys;
}

export type EventKeys = "MessageModerated" | "MessageVoted" | "PollVoted" | "RoomCreated" | "RoomExpired" | "PollCreated" | "RoomVisualized" | "MessageCreated";

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

export interface RoomVisualized extends Event {
  key: "RoomVisualized";
  data: {
    id: string;
    roomId: string;
    visuals: Object[];
  };
}

export interface PollCreated extends Event {
  key: "PollCreated";
  data: {
    id: string;
    userId: string;
    title: string;
    about: string;
    createDate: string;
    duration: number;
    roomType: "poll";
  };
}
