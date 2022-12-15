**Primary Owner:** Siddharth Raju

**Github:** [sid2023](https://github.com/sid2033)

**Co-Owner:** Jack Bisceglia

**Github:** [Jack Bisceglia](https://github.com/jackbisceglia)

---

## Description

This service is another part of our visualization logic and is responsible for processing the visualization and generating the URL to access the image. This service is separated and implemented in python using Fast API to simplify the process of visualizing the data. We use matplotlib for the visualizations. We use Amazon S3 as our data store for hosting the images.

## Interactions

This service only interacts with visualizer for the purpose of generating these URLs.

## Endpoints

It has two test endpoints and one main endpoint. This main endpoint is a POST request which comes in from the visualizer service. The body of this request contains all the expired room's data. Based on this data and whether the room is a message or poll, it processes the data and hosts the image on Amazon S3 and returns the URL.

Test Endpoints:

### `/`

**Method**: GET

**URL Params**: None

**Body**: None

### Sample Response

```python
None
```

### `/visual`

**Method**: GET

**URL Params**: None

**Body**: None

### Sample Response

```JSON

{"Visualizer Listening": "Hello World"}

```

### `/visual`

**Method**: POST

**URL Params**: None

**Body**: Required

### Body Type

```typescript
interface messageRequestBody {
  id: string;
  user_id: string;
  title: string;
  about: string;
  room_type: "message";
  duration: number;
  create_date: string;
  expire_date: string;
  messages: Messages[];
}
|
interface pollRequestBody {
  id: string;
  user_id: string;
  title: string;
  about: string;
  room_type: "poll";
  duration: number;
  create_date: string;
  expire_date: string;
  polls: Poll[];
}
```

### Sample Response

```JSON

{"img_url": "https://letsthink-viz.s3.us-east-2.amazonaws.com/sample-url.png"}

```

## How to Run

To install requirements, run `pip install --no-cache-dir --upgrade -r ./requirements.txt`. To then run the visual-generator service, run `uvicorn src.main:app --reload --host 0.0.0.0 --port 4010`.
