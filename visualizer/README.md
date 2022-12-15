**Owner:** Siddharth Raju

**Github:** [sid2023](https://github.com/sid2033)

---

## Description

The visualizer service is responsible for processing a visualization of a room's data when it expires. This is responsible for performing the logic related to visualizing the data and providing a URL to accecss it from. This service has a MongoDB instance for a database which is responsible for storing every room that has been visualized along with the URL.

## Interaction

When receiving a "RoomExpired" event, it calls the visual-generator service to generate the visualizations along with the URL to access them. The service listens for "RoomExpired" events so that it can visualize the expired room. It then creates a "RoomVisualized" event which is then sent out based on the data that is processed. Both these event interfaces are shown below.

```typescript
interface RoomExpired {
  key: "RoomExpired";
  data: {
    id: string;
  };
}
```

```typescript
interface RoomVisualized {
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
```

## Endpoints

No endpoints for this service.

## How to Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.
