**Owner:** Siddharth Raju

**Github:** sid2033

This service is responsible for processing the visualization and generating the URL to access the image. This service only interacts with visualizer for this purpose. This service is separated and implemented in python using Fast API to simplify the process of visualizing the data. We use matplotlib for the visualizations. It has two test endpoints and one main endpoint. This main endpoint is a POST request which comes in from the visualizer service. The body of this request contains all the expired room's data. Based on this data and whether the room is a message or poll, it processes the data and hosts the image on Amazon S3 and returns the URL.
