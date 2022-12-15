# Polls Service

**Owner:** Ashir Imran

**Github:** [LinkFrost](https://github.com/LinkFrost)

---

## Description

The polls service is responsible for handling the creating of poll options on rooms in our application. If a room is configured with the "poll" type, a user will be prompted to enter 2-10 poll options, and this service will create those options and store it in a database.

## Interactions

The polls service listens to the "RoomCreated" and "RoomExpired" events from the Rooms and Expiration services, respectively. Internally, this is done so that poll options cannot be created for rooms that do not exist, or so that poll options cannot be created for expired rooms. Each poll option has it's own id, as well as a field called "position", so that the exact ordering of the poll options as declared by the user is maintained throughout services.

**Active Rooms Table**

1. id (id of the room itself)

**Poll Options Table**

1. id (id of the poll option itself)
2. room_id (id of the room the poll option is created for)
3. title (the content of the poll option)
4. position (number for keeping track of the ordering of poll options)

## Endpoints

### `/polls`

**Method**: POST
**URL Params**: None
**Body**: Required

### Body Type

```typescript
interface body {
  room_id: string;
  poll_options: poll_options[] {
    title: string (Max 60 characters),
    position: number;
  }
}
```

### Sample Response

```JSON
{
  "room_id": "bb858f2f-36fb-4286-be80-f64499f059f4",
  "poll_options": [
    {
      "title": "Option A",
      "position": 1
    },
    {
      "title": "Option B",
      "position": 2
    },
    {
      "title": "Option C",
      "position": 3
    }
  ]
}
```

## How To Run

To run this service, run `npm install` and `npm run dev`. To build the TypeScript, you can use the `npm run build` command.
