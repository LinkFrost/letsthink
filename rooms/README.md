# Rooms Service

**Owner:** Joseph Petrillo

**GitHub:** [joepetrillo](https://github.com/joepetrillo)

---

## Description

The rooms service is solely responsible for handling the creation of new rooms and notifying the event bus. The entire usage of our application begins with this service. Ultimately, the majority of the other services in our application rely on rooms being created and this service starting a new room.

## Interactions

The rooms service does not listen to any incoming events (not a subscriber to anything). There is nothing else happening in our services that the rooms service cares about. We simple store the **static** details of a room upon creation (which will never change). On the other hand, it does send a "RoomCreated" event to the event bus after the successful creation of a room. PostgreSQL is used to store the following information about a room.

1. id (id of the room itself)
2. user_id (user_id of the owner of the room)
3. title (title of the room)
4. about (description of the room)
5. room_type (message or poll)
6. duration (number of minutes room will be active)
7. create_date (UTC timestamp of when room was created)

## Endpoints

There is one endpoint which is used to create a new room.

### `/rooms`

**Method**: POST

**URL Params**: None

**Body**: Required

### Body Type

```typescript
interface requestBody {
  user_id: string;
  title: string;
  about: string;
  room_type: "message" | "poll";
  duration: number;
}
```

### Sample Response

```JSON
{
  "expire_date": "2022-12-13T00:11:00.000Z",
  "id": "fe4dc9f4-0198-480d-beb0-c0859d5814c1",
  "user_id": "653fe4e2-54c8-41a5-8367-c28df4b5f514",
  "title": "Sample Name",
  "about": "Sample Description",
  "room_type": "message",
  "duration": 5,
  "create_date": "2022-12-13T00:06:00.000"
}
```

## How To Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.

## Exceeding

After the base functionality was finished in this service, I went back to ensure I was used types as much as I could as well as doing proper error handling (error codes, try/catch blocks, etc). I also used a type validator (zod) to ensure the incoming body was in the expected shape. Lastly, I created three helper functions to initialize the event bus, postgres connection, and express server. These were very helpful across the rest of our services.
