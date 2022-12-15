# Event Bus Service

**Owners:**

[Joseph Petrillo](https://github.com/joepetrillo)

[Jack Bisceglia](https://github.com/jackbisceglia)

[Siddharth Raju](https://github.com/sid2033)

[Ashir Imran](https://github.com/LinkFrost)

---

## Description

The event bus used for letsthink is RabbitMQ. Each service is initialized to communicate with RabbitMQ using Publisher/Subscribe logic. This gives each service a queue named after the service, and has a list of keys that the service binds, or "subscribes" to.

## Interactions

**Event Keys**:

- RoomCreated
- RoomExpired
- MessageCreated
- PollCreated
- MessageVoted
- PollVoted
- RoomVisualized
- UserCreated
- HTTPRequest

## RabbitMQ

As stated above, RabbitMQ is the event bus system for letsthink. In every service, there is a file called `initRabbit.ts` that creates a connected channel to the event bus. An exchange is established, and each service asserts a queue for it's service. When calling initRabbit in each service, an array of event keys can be passed in. Then, when connecting, first the service unbinds itself from _all_ keys, and then binds to the passed in array. This allows for dynamic subscription logic, creating a direct exchange.

## How To Run

While each service was developed to run on its own, they all still require a connection to the event bus. Therefore, when running the app with docker compose, the event bus is the first container that is created and ran, and health checks are put into place so that every service can reliably connect to it.
