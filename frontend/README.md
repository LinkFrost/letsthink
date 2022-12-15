# Frontend Service

## Owners
Ashir Imran

**GitHub:** [LinkFrost](https://github.com/LinkFrost)

Jack Bisceglia

**GitHub:** [jackbisceglia](https://github.com/jackbisceglia)

Siddharth Raju

**GitHub:** [https://github.com/sid2033](https://github.com/)

Joe Petrillo

**GitHub:** [](https://github.com/joepetrillo))

---

## Technologies

- React
- TypeScript
- Next.js
- TailwindCSS
- Zod

## Description

The frontend service is the client side entry point for our project. The user uses this service to interact with all of our microservices. This provides all the basic interfaces we have, such as: signup, login, room creation, polls, message boards, etc. We use React alongside a popular React framework, Next.js, which allows us to simplify the routing developer experience, using Next's built-in file-based directory system in `src/pages`. This is fully fledged with authentication to make the app secure and robust from end to end.

## Interactions

The frontend interacts with nearly all of our microservices to peform the various operations throughout the lifecycle of the application. This model demonstrates the power, scalability and flexibility of the microservice architecture.

## Endpoints
- GET `<QueryService>/query/rooms/:room_id`
- GET `<QueryService>/query/rooms/user/:user_id`
- POST `<RoomsService>/rooms`
json
```js
{
  "user_id": string;
  "title": string;
  "about": string;
  "room_type": "message" | "poll";
  "duration": number;
}
```
- POST `<PollsService>/polls`
json
```js
{
  "room_id": string;
  "poll_options": poll_options[] {
    "title": string (Max 60 characters),
    "position": number;
}
```
- POST `<MessagesService>/messages`
json
```js
{
  "room_id": string;
  "room_id": string; (Max 150 characters)
}
```
- POST `<VoteService>/messages`
json
```js
{
  "message_id": string;
  "room_id": string;
}
```
- POST `<VoteService>/polls`
json
```js
{
  "option_id": string;
  "room_id": string;
}
```
-POST `<AuthService>/auth/login`
```js
{
 "email": string;
 "password": string;
}
```
- POST `<AuthService>/auth/refresh`

## How To Run
2. run `npm install` to install dependencies
3. run `npm run dev` to boot the dev server
4. If you'd like to build the typescript, you can use the `npm run build` command, and find the output in the `/build` directory.

## Exceeding Aspects
I'd say the frontend is considered exceeding. The first point would be that we have implemented a full, end to end authentication system using JSON Web Tokens. We've made sure to avoid XSS attacks commonly caused by local storage, and CSRF attacks commonly caused by storing only cookies, by using opaque refresh tokens along with short-lived JWTs, alongside a refresh token intervals. 

In addition, we've implemented every single aspect of the client side application very thoroughly. Message Boards and Polls update live every 2 seconds with new results. Our styling is thorough and pleasant, and we've taken a serious interest in designing a good UX.
