# Moderator Service

**Owner:** Jack Bisceglia

**GitHub:** [jackbisceglia](https://github.com/jackbisceglia)

---

## Technologies

- Typescript: main service code
- MongoDB: data persistence and banned words storage
- RabbitMQ (via amqpblib): event bus

## Description

The moderator service is responsible for moderating incoming messages. The general flow is the when the client posts a message, before the messages service continues down its standard path, it posts to the moderator service in order to check on moderation status. This is done via HTTP instead of async via RabbitMQ so that we can block our regular service lifecycle in the event of an invalid message being posted. For the sake of UX, we want to make sure that the user knows immediately that their message is invalid, so instead of letting this process communicate async, we block user action until moderator has processed the message. In this event, it checks against a list of banned words in the database and returns the validity status, and the array of banned words used, if any.

## Interactions

The moderator service strictly communicates via HTTP, and only with the messages service. As outlined above, we wanted to block any further application cycle concerning a message to take place until we can confirm the validity status of the message posted. Because of the strictly async nature of RabbitMQ, we decided to use service-to-service communication via HTTP instead to ensure proper UX. Thus, the messages service will post to the moderator's `/moderate` endpoint with the message in a json payload, in order to get this validation status. Furthermore this service interacts with a MongoDB instance in order to store store 3 things:

1. the list of banned words
2. a copy of all accepted messages
3. a copy of all rejected messages, and which words were banned

They have the following shapes respectively:

```js
{
    _id: number,
    word: string
}
```

```js
{
    _id: number,
    message: string
}
```

```js
{
    _id: number,
    message: string,
    bannedWords: [<array of banned words>]
}
```

## Endpoints

#### POST `/moderate`

json payload:

```json
{
  "message": "string"
}
```

response:

```js
{
    "status": "rejected" | "accepted",
    "invalidWords": [<array of banned words>]
}
```

## How To Run

1. _if not using docker_: grab the following environment variables and place into .env at the root of the service
   - MODERATOR_MONGO_USER
2. run `npm install` to install dependencies
3. run `npm run dev` to boot the dev server
4. If you'd like to build the typescript, you can use the `npm run build` command, and find the output in the `/build` directory.
