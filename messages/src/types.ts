export interface RoomCreatedEvent {
  type: "RoomCreated";
  data: {
    userId: string;
    title: string;
    about: string;
    duration: number;
    roomType: string;
    expired: boolean;
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

export type Event = RoomCreatedEvent;
