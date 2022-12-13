**Owner:** Siddharth Raju

**Github:** sid2033

The visualizer service is responsible for processing a visualization of a room's data when it expires. This is responsible for performing the logic related to visualizing the data and providing a URL to accecss it from. This service has a MongoDB instance for a database which is responsible for storing every room that has been visualized along with the URL.

When receiving a "RoomExpired" event, it calls the visual-generator service to generate the visualizations along with the URL to access them. Once finished, it sends out a "RoomVisualized" event which has the URL and other information related to the room.

For the exceeding section, this functionality of the visualization is split into two services. This is visualizer and the other one is visual-generator. That service is written in python and is responsible for actually generating the visualization image and then uploading it to generate the URL. This is due to the better visualization capability offered by libraries in python.
