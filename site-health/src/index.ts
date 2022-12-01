import amqplib from "amqplib";

// Connect to rabbitmq, create a channel
const eventBusConnection: amqplib.Connection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel: amqplib.Channel = await eventBusConnection.createChannel();

const queue: string = "site-health";
const exchange: string = "event-bus";

// Create exchange
eventBusChannel.assertExchange(exchange, "direct", {
  durable: false,
});

const eventKeys: string[] = ["room-events", "message-events", "moderator-events", "vote-events", "expiration-events"];

// Create queue for service
eventBusChannel.assertQueue(queue);

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue(queue, exchange, key);
});

interface SiteHealthData {
  totalRooms: number;
  activeRooms: number;
  expiredRooms: number;
  pollRooms: number;
  messageRooms: number;
  totalVotes: number;
  totalMessages: number;
  requestRate: number;
  totalUsers: number;
  errorRate: number;
}

interface RoomExpiredEvent {
  type: "RoomExpired";
  data: {
    roomId: string;
    expiredData: string;
  };
}

interface RoomCreatedEvent {
  type: "RoomCreated";
  data: {
    roomType: "message" | "poll";
    userId: string;
    title: string;
    description: string;
  };
}

interface MessageModeratedEvent {
  type: "MessageModerated";
  data: {
    userId: string;
    roomId: string;
    content: string;
    moderated: "pending" | "accepted" | "rejected";
  };
}

interface UserCreatedEvent {
  type: "UserCreated";
  data: {
    id: string;
    email: string;
    username: string;
    password: string;
  };
}

interface PollVotedEvent {
  type: "PollVoted";
  data: {
    id: string;
    email: string;
    username: string;
    password: string;
  };
}

interface MessageVotedEvent {
  type: "MessageVoted";
  data: {
    id: string;
    email: string;
    username: string;
    password: string;
  };
}

interface MessageCreatedEvent {
  type: "MessageCreated";
  data: {
    userId: string;
    roomId: string;
    content: string;
  };
}

type Event = RoomCreatedEvent | MessageCreatedEvent | RoomExpiredEvent | any;

// Listen for incoming messages
eventBusChannel.consume(queue, (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    switch (type) {
      case "RoomExpired": {
        const siteHealthData: SiteHealthData = fetchSiteHealthData();
        siteHealthData.expiredRooms += 1;
        updateDatabase(siteHealthData);
      }
      case "RoomCreated": {
        const siteHealthData: SiteHealthData = fetchSiteHealthData();
        siteHealthData.totalRooms += 1;
        siteHealthData.activeRooms += 1;

        if (data.roomType === "message") {
          siteHealthData.messageRooms += 1;
        } else {
          siteHealthData.pollRooms += 1;
        }
        updateDatabase(siteHealthData);
      }
      case "MessageModerated": {
        if (data.moderated === "accepted") {
          const siteHealthData: SiteHealthData = fetchSiteHealthData();
          siteHealthData.totalMessages += 1;
          updateDatabase(siteHealthData);
        }
      }
      case "UserCreated": {
        const siteHealthData: SiteHealthData = fetchSiteHealthData();
        siteHealthData.totalUsers += 1;
        updateDatabase(siteHealthData);
      }
      case "PollVoted": {
        const siteHealthData: SiteHealthData = fetchSiteHealthData();
        siteHealthData.totalVotes += 1;
        updateDatabase(siteHealthData);
      }
      case "MessageVoted": {
        const siteHealthData: SiteHealthData = fetchSiteHealthData();
        siteHealthData.totalVotes += 1;
        updateDatabase(siteHealthData);
      }
      case "RequestError": {
        const siteHealthData: SiteHealthData = fetchSiteHealthData();
        siteHealthData.errorRate += 1;
        updateDatabase(siteHealthData);
      }
    }

    // Acknowledge the message to the queue
    eventBusChannel.ack(message);
  }
});

const fetchSiteHealthData = () => {
  const mockData: SiteHealthData = {
    totalRooms: 0,
    activeRooms: 0,
    expiredRooms: 0,
    pollRooms: 0,
    messageRooms: 0,
    totalVotes: 0,
    totalMessages: 0,
    requestRate: 0,
    totalUsers: 0,
    errorRate: 0,
  };

  return mockData;
};

const updateDatabase = (siteHealthData: SiteHealthData) => {
  return true;
};
