**Owner:** Siddharth Raju

**Github:** sid2033

---

## Description

The visualizer service is responsible for processing a visualization of a room's data when it expires. This is responsible for performing the logic related to visualizing the data and providing a URL to accecss it from. This service has a MongoDB instance for a database which is responsible for storing every room that has been visualized along with the URL.

## Interaction

When receiving a "RoomExpired" event, it calls the visual-generator service to generate the visualizations along with the URL to access them. Once finished, it sends out a "RoomVisualized" event which has the URL and other information related to the room.

## Endpoints

It has one test endpoint to check if the service is working. The service listens for "RoomExpired" events so that it can visualize the expired room. It then creates a "RoomVisualized" event which is then sent out based on the data that is processed. Both these event interfaces are shown below.

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

## How to Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.

## Exceeding

For the exceeding section, this functionality of the visualization is split into two services. This is visualizer and the other one is visual-generator. That service is written in python and is responsible for actually generating the visualization image and then uploading it to generate the URL. This is due to the better visualization capability offered by libraries in python.

I learned how to use MongoDB for the purpose of this project and have now become familiar with the setup and integration of MongoDB instances. This includes the setup and CRUD operations related to various databases, collections, and documents.
