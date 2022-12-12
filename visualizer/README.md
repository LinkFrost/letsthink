**Owner:** Siddharth Raju

**Github:** sid2033


The visualizer service is responsible for processing a visualization of a room's data when it expires. When receiving a "RoomExpired" event, It calls the visual-generator service to generate the visualizations along with the URL to access them. Once finished, it sends out a "RoomVisualized" event which has the URL and other information related to the room.
