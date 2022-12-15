# Moderator Service

**Owner:** Jack Bisceglia

**GitHub:** [jackbisceglia](https://github.com/jackbisceglia)

---

## Technologies

- Typescript: main service code
- MongoDB: data persistence and banned words storage
- RabbitMQ (via amqpblib): event bus

## Description

The moderator service is responsible for moderating incoming messages. The general flow is the when the client posts a message, before the messages service continues down its standard path, it posts to the moderator service in order to check on moderation status. This is done via HTTP instead of async via RabbitMQ so that we can block our regular service lifecycle in the event of an invalid message being posted. For the sake of UX, we want to make sure that the user knows immediately that their message is invalid, so instead of letting this process async, we block user action until moderator has processed the message. In this event, it checks against a list of bannedwords in the database and returns the validity status, and the array of banned words used, if any.

## Interactions

```json
{
    "email": "user email",
    "visualizations": [<array of visualizations urls>]
}
```

This is the main data persistence for this service, so that we haev a wholly accurate log of user visualizations and emails to which they are tied.

## Endpoints

This service only partakes in communications from the event-bus, and does not rely on any endpoints of its own, as it is at the end of the chain of events upon room expiration.

## How To Run

1. _if not using docker_: grab the following environment variables and place into .env at the root of the service
   - SIB_API_KEY
   - SIB_SENDER_EMAIL
   - SENDER_NAME
2. run `npm install` to install dependencies
3. run `npm run dev` to boot the dev server
4. If you'd like to build the typescript, you can use the `npm run build` command, and find the output in the `/build` directory.
