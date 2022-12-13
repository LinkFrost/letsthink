# Expiration Service

**Owner:** Joseph Petrillo

**GitHub:** [joepetrillo](https://github.com/joepetrillo)

---

## Description

The expiration service is responsible for tracking the expiration dates of rooms and telling the event bus when any given room has expired (by sending an event). When a room is created, the user chooses a time for it to expire. For example, it is currently 2:00 PM and the user chooses for their room to expire at 2:05 PM. The expiration service will receive a "RoomCreated" event with a timestamp that represents when the room will be expired (2:05 PM). Expiration will store the room_id that expires at this time in redis. Every minute the service checks if the current time has any room_ids that should be expiring. So in our example, the expiration service will check at 2:00 PM, 2:01 PM, 2:02 PM, 2:03 PM, 2:04 PM, and finally at 2:05 PM where it sends a room expired event for the rooms that expire at that time.

## Interactions

The expiration service sends a "RoomExpired" event to the event bus when a room expires. The only event it is subscribed to is "RoomCreated". In Redis, I am storing a key value pair, where the key is an expiration timestamp and the value is a set of room_ids that expire at that time. When this time eventually passes and the "RoomExpired" events have sent, I delete the key value pair entirely (no longer needed). Below is my mental model of how this is being stored (where room_id would be valid room ids).

```typescript
{
    "2022-12-13T00:11:00.000Z": ["room_id", "room_id", "room_id", "room_id"]
    "2022-12-13T00:19:00.000Z": ["room_id", "room_id", "room_id", "room_id"]
}
```

## Endpoints

This service does not use express and therefore does not have any endpoints. Everything needed for this service to work is achieved using events through our RabbitMQ event bus. The "RoomExpired" event itself looks like the following, where id is the id of the room that has expired.

```typescript
interface RoomExpired {
  key: "RoomExpired";
  data: {
    id: string;
  };
}
```

## How To Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.

## Exceeding

I learned how to use Redis and how to set it up as a primary database. It is persistent and uses "appendonly" mode, which saves the data every second.
