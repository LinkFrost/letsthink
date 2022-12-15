# Email Service

**Owner:** Jack Bisceglia

**GitHub:** [jackbisceglia](https://github.com/jackbisceglia)

---

## Technologies

- Typescript: main service code
- SendInBlue: email sending
- MongoDB: data persistence
- RabbitMQ (via amqpblib): event bus

## Description

The email service is responsible for dispatching emails to room owners following its' expiration. When a room has been active for the duration in which the owner has chosen, the email service will be listening for a "RoomVisualized" event. On receiving this event, the service breaks down the event data, and reformats it as an email, including room title, and a visualization of the room's data. The email service then fires an email to the owner's email using the SendInBlue email API.

## Interactions

The email service listens for only one event: "RoomVisualized". When this is received, the service makes a connection to SendInBlue's API, a 3rd party API for email dispatching. Upon connection, it builds an email instance with the data sent from the visualizer service, and then sends it to the user's email so that they can store their visual data over time following its expiration. The service also interacts with a MongoDB instance which stores documents in the following shape:

```json
{
    "email": "user email",
    "visualizations": [<array of visualizations urls>]
}
```

This is the main data persistence for this service, so that we have a wholly accurate log of user visualizations and emails to which they are tied.

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

## Exceeding Aspects

1. I think the fact that this service is a fully integrated email service, as opposed to something simple using nodemailer or a similar smtp library, would categorize the service as something that is exceeding. It is integrated with SendInBlue, which ensures that our emails are sent from verified servers, and error handling with regards to smtp communication is well handled. We've attached a verified domain so that all requests come from a safe email, `noreply@letsth.ink`.
2. Additionally, I think the code is well written, and has been refactored many times over to try to ensure peak code quality, readability, and by extension, documentation.
