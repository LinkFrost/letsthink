**Owner:** Siddharth Raju

**Github:** sid2033

---

## Description

The site-health service stores data related to the various requests and events that happen during the use of the app. It stores information such as the total rooms created, total requests, etc. We use MongoDB to store, read, and update this information quickly. The data is stored as multiple documents containing data about a specific room.

## Interaction

Whenever the service receives an event such as "RoomCreated" or "UserCreated", it will appropriately update the relevant data in the database. This service isn't directly used by any other service so it is usually accessed externally.

## Endpoints

It has a single endpoint which is used to retrieve the site-health data (GET).

### `/site-health`

**Method**: GET

**URL Params**: None

**Body**: None

### Sample Response

```JSON
{
    "totalRooms": 14,
    "activeRooms": 3,
    "expiredRooms": 11,
    "pollRooms": 5,
    "messageRooms": 9,
    "totalVotes": 15,
    "totalMessages": 44,
    "totalUsers": 9,
    "totalRequests": 30,
    "errors": 2,
}
```

## How to Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.

## Exceeding

I learned how to use MongoDB for the purpose of this project and have now become familiar with the setup and integration of MongoDB instances. This includes the setup and CRUD operations related to various databases, collections, and documents.
