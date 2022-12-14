**Owner:** Siddharth Raju

**Github:** sid2033

---

## Description

The query service is responsible for storing data related to mainly rooms. This data is used in the front-end as what the user will interact with. This service uses MongoDB to store all this relevant data.

## Interactions

This service listens for the majority of events. Whenever anything is created or updated (such as a room, user, vote), the query's database is updated to reflect this change.

## Endpoints

This service has two endpoints. One endpoint to get the query data that is relevant to a room and one to get the query data that is relevant to a specific user.

## How to Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.

## Exceeding

I learned how to use MongoDB for the purpose of this project and have now become familiar with the setup and integration of MongoDB instances. This includes the setup and CRUD operations related to various databases, collections, and documents.
