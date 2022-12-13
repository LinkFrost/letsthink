# Vote Service

**Owner:** Joseph Petrillo

**GitHub:** [joepetrillo](https://github.com/joepetrillo)

---

## Description

The vote service is responsible for handling any "voting" that occurs in our application. Voting in our application is either liking a message, or choosing an option on a poll. Voting does not require the user voting to be logged in, and should expect many votes to be happening in any given room at any given moment (unless the room is expired).

## Interactions

The vote service listens to the "PollCreated", "MessageCreated", "RoomCreated", and "RoomExpired" events. Internally, the vote service stores what rooms are active, the number of likes for each message, and the number of votes for each poll option. To properly store and update this data, all of the previously listed events are required. Also, the vote service sends out "MessageVoted" and "PollVoted" events upon the succesful "vote" of a message or poll, respectively. PostgreSQL is used to store the following information about votes.

**Active Rooms Table**

1. id (id of the room itself)

**Messages Table**

1. id (id of the message)
2. votes (number of likes the message has)

**Messages Table**

1. id (id of the poll option)
2. votes (number of votes for the poll option)

## Endpoints

There are two endpoints which are used to send a vote. The messages endpoint handles liking a message, and the polls endpoint handles adding a vote to a poll option. For both endpoints, if the room associated with the message or poll option is expired, the vote will be unsuccesful.

### `/messages`

**Method**: POST

**URL Params**: None

**Body**: Required

### Body Type

```typescript
interface requestBody {
  message_id: string;
  room_id: string;
}
```

### Sample Response

```JSON
{
  "room_id":"a6ee6e0f-45b4-4a1b-b1f8-8001c72c5979",
  "id":"7b8e4ff2-86c8-4955-838f-a5b4efdbee5c",
  "votes": 19
}
```

### `/polls`

**Method**: POST

**URL Params**: None

**Body**: Required

### Body Type

```typescript
interface requestBody {
  option_id: string;
  room_id: string;
}
```

### Sample Response

```JSON
{
  "room_id":"0b130dde-d5fd-4ea8-8940-2666e5bac90a",
  "id":"08a4015f-b527-4a93-88e3-2ce5585e59ce",
  "votes": 23
}
```

## How To Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.
