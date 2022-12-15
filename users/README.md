# Users Service

**Owner:** Jack Bisceglia

**GitHub:** [jackbisceglia](https://github.com/jackbisceglia)

---

## Technologies

- Typescript: main service code
- PostgreSQL: data persistence for user credentials
- Argon2: password hashing
- RabbitMQ (via amqpblib): event bus

## Description

The users service primarily handles user sign ups. This is the main source of truth for our whole app's userbase. When a user first goes to our app, and is met with the option to sign up (assuming they don't have an acoount and are yet to be authenticated), they are met with the sign up page. They then can sign up and their sign up is handled by the user service, which deals with securing user credentials and storing in the database. The user is then able to use the app with these credentials and securely interact with the authentication service.

## Interactions

The user service has two primary interactions...

First, it has HTTP communication from the client. When a user signs up, upon successfuly client side credential validation (password length, email format, matching passwords). The client will the send a `POST` to `/users` and attach the user's credentials as a json payload on the body. From here, the users service hash's the password using argon2, as popular and secure password hashing algorithm, and store's the user's credentials in the database, ensuring no duplicate emails/usernames are created.

The second mode of communication is with the RabbitMQ event bus via amqplib. When a user's sign up has been successfully processed by this service, we emit a `UserCreated` event so that other services, namely Query, can update their data store with the new user's information.

As an additional communication note, the Authentication service frequently reads from the Users PostgreSQL database when authenticating users on login.

The data store has the following SQL table schema:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  password text not null
);
```

## Endpoints

#### POST `/users`

json payload:

```json
{
  "email": "string",
  "username": "string",
  "password": "string"
}
```

response:

```json
{
  "id": "string",
  "email": "string",
  "username": "string"
}
```

## How To Run

1. _if not using docker_: grab the following environment variables and place into .env at the root of the service
   - USERS_PG_PASSWORD
2. run `npm install` to install dependencies
3. run `npm run dev` to boot the dev server
4. If you'd like to build the typescript, you can use the `npm run build` command, and find the output in the `/build` directory.
