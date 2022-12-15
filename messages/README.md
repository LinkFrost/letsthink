# Messages Service

**Owner:** Ashir Imran

**Github:** [LinkFrost](https://github.com/LinkFrost)

---

## Description

The messages service is responsible for handling the creating of messages on rooms in our application. If a room is configured with the "message" type, a user can create a message through the frontend by interacting with this service.

## Interactions

The messages service listens to the "RoomCreated" and "RoomExpired" events from the Rooms and Expiration services, respectively. Internally, this is done so that messages cannot be created for rooms that do not exist, or so that messages cannot be created for expired rooms. Messages also interacts with the Moderator service, to check if a message is allowed to even be created by comparing the message content to a list of banned words. If a message is denied, the client will receive a list of words that were flagged with an error saying the message was rejected. Otherwise, the client receives the created message object from the database, and this is used by the frontend to instantly display the message without having to wait for a fetch from the Query service.

**Active Rooms Table**

1. id (id of the room itself)

**Messages Table**

1. id (id of the message itself)
2. room_id (id of the room the message is created for)
3. content (the actual message)
4. create_date (Timestamp that the message was created, in UTC time)

## Endpoints

### `/messages`

**Method**: POST
**URL Params**: None
**Body**: Required

### Body Type

```typescript
interface body {
  room_id: string;
  content: string; (Max 150 characters)
}
```

### Sample Response

```JSON
{
  "status": "accepted",
  "id": "608130f0-05fd-46f1-9941-3eae0b16c291",
  "room_id": "bb858f2f-36fb-4286-be80-f64499f059f4",
  "content": "This is a test comment",
  "create_date": "2022-12-15 02:34:59.852557+00"
}
```

## How To Run

To run this service, run `npm install` and `npm run dev`. To build the TypeScript, you can use the `npm run build` command.
