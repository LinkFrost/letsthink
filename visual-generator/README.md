**Owner:** Siddharth Raju

**Github:** sid2033

This service is another part of our visualization logic and is responsible for processing the visualization and generating the URL to access the image. This service is separated and implemented in python using Fast API to simplify the process of visualizing the data. We use matplotlib for the visualizations. We use Amazon S3 as our data store for hosting the images.

This service only interacts with visualizer for the purpose of generating these URLs.

It has two test endpoints and one main endpoint. This main endpoint is a POST request which comes in from the visualizer service. The body of this request contains all the expired room's data. Based on this data and whether the room is a message or poll, it processes the data and hosts the image on Amazon S3 and returns the URL.

For the exceeding section, this functionality of the visualization is split into two services. This is visual-generator and the other one is visualizer. This service is written in python and is responsible for actually generating the visualization image and then uploading it to generate the URL. This is due to the better visualization capability offered by libraries in python. The other service is responsible for mostly event logic and database logic.
