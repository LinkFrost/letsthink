import amqplib from "amqplib";
import initRabbit from "./initRabbit.js";
import type { MessageModerated, MessageVoted, PollVoted, RoomCreated, RoomExpired, UserCreated, HTTPRequest } from "./events.js";

const { eventBusChannel, confirmChannel } = await initRabbit("site-health", [
  "RoomCreated",
  "RoomExpired",
  "MessageVoted",
  "MessageModerated",
  "PollVoted",
  "HTTPRequest",
  "UserCreated",
]);

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

type Event = RoomCreated | RoomExpired | MessageModerated | UserCreated | PollVoted | MessageVoted | HTTPRequest;

// Listen for incoming messages
eventBusChannel.consume("site-health", (message) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());
    const siteHealthData: SiteHealthData = fetchSiteHealthData();

    switch (key) {
      case "RoomExpired":
        siteHealthData.expiredRooms += 1;
        updateDatabase(siteHealthData);
        break;
      case "RoomCreated":
        siteHealthData.totalRooms += 1;
        siteHealthData.activeRooms += 1;

        if (data.roomType === "message") {
          siteHealthData.messageRooms += 1;
        } else {
          siteHealthData.pollRooms += 1;
        }
        updateDatabase(siteHealthData);
        break;
      case "MessageModerated": {
        if (data.moderated === "accepted") {
          siteHealthData.totalMessages += 1;
          updateDatabase(siteHealthData);
        }
      }
      case "UserCreated": {
        siteHealthData.totalUsers += 1;
        updateDatabase(siteHealthData);
      }
      case "PollVoted": {
        siteHealthData.totalVotes += 1;
        updateDatabase(siteHealthData);
      }
      case "MessageVoted": {
        siteHealthData.totalVotes += 1;
        updateDatabase(siteHealthData);
      }
      case "HTTPRequest": {
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
