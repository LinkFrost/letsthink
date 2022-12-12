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

// ROOM EVENTS

export interface RoomCreated extends Event {
  key: "RoomCreated";
  data: {
    id: string;
    user_id: string;
    title: string;
    about: string;
    room_type: "message" | "poll";
    duration: number;
    create_date: string;
    expire_date: string;
  };
}

export interface RoomExpired extends Event {
  key: "RoomExpired";
  data: {
    id: string;
  };
}

export interface RoomVisualized extends Event {
  key: "RoomVisualized";
  data: {
    id: string;
    room_id: string;
    title: string;
    user_email: string;
    username: string;
    imageUrl: string;
  };
}

// MESSAGE EVENTS

export interface MessageModerated extends Event {
  key: "MessageModerated";
  data: {
    user_id: string;
    room_id: string;
    content: string;
    moderated: "pending" | "accepted" | "rejected";
  };
}

export interface MessageVoted extends Event {
  key: "MessageVoted";
  data: {
    id: string;
    votes: number;
    room_id: string;
  };
}

export interface MessageCreated extends Event {
  key: "MessageCreated";
  data: {
    id: string;
    room_id: string;
    content: string;
  };
}

// POLL EVENTS

export interface PollVoted extends Event {
  key: "PollVoted";
  data: {
    id: string;
    votes: string;
    room_id: string;
  };
}

export interface PollCreated extends Event {
  key: "PollCreated";
  data: {
    room_id: string;
    poll_options: PollOptions[];
  };
}

export interface PollOptions {
  id: string;
  title: string;
  position: number;
  votes: number;
}

// USER EVENTS

export interface UserCreated extends Event {
  key: "UserCreated";
  data: {
    id: string;
    email: string;
    username: string;
    password: string;
  };
}

// HEALTH EVENTS

export interface HTTPRequest extends Event {
  key: "HTTPRequest";
  data: {
    status: number;
  };
}
