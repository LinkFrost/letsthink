# Authenticator Service

**Owner:** Ashir Imran

**Github:** [LinkFrost](https://github.com/LinkFrost)

---

## Description

The authenticator service is is responsible for authorizing users on the website, as well as authentication logic. When a user logs in to letsthink, after verifying that the user exists in the users database, and that the password checks out with the hashed version in the database, a jsonwebtoken is created, containing a payload that has the user data (user id, email, and username specifically). These access tokens are set to expire after 15 days, so a refresh token is created as well, which expires in 30 days. This refresh token can be used to request a new acess token, and is embedded as a HTTPonly cookie on the client side, while the access token is meant to be used in the Authorization header when making HTTP requests to various protected routes. There is also logic for logging a user out.

## Interactions

The authenticator does not interact with any service through the event bus, and instead acts as a gateway between the client and the various protected features of the app. It also directly communicates with the users service's database for authentication purposes. We felt this approach was best as this database contains confidential information like passwords, so it would be better to not duplicate this data across various databases, with the exception of the query service (which does not receive passwords). These client related interactions are done with HTPP requests, which will be outlined below.

**Users Table**

1. id (id of the user)
2. email (unique)
3. username (unique)
4. password (hashed using the argon2 encryption algorithm)

## Endpoints

### `/auth/login`

**Method**: POST
**URL Params**: None
**Body**: Required

### Body Type

```typescript
interface body {
  email: string;
  password: string;
}
```

Sample Reponse:

```JSON
{
  "success": "Successfully authorized"
}
```

Headers:

```JSON
{
  "Access-Control-Expose-Headers" : "Authorization",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,Content-Length",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OSIsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20ifQ.PnkFEL4NnavgRkxON5BQSdOTpGHyCPcpt9FbAZOgJpo"
}
```

Cookies:

```JSON
{
  "refreshToken": {
    "httpOnly": true,
    "secure": true,
    "sameSite": true,
    "path": "/auth"
  }
}
```

---

### `/auth/refresh`

**Method**: GET
**URL Params**: None
**Body**: None
**Cookies**: "refreshToken" (follows Bearer JWT token pattern)

Sample Reponse:

```JSON
{
  "success": "Generated new access token"
}
```

Headers:

```JSON
{
  "Access-Control-Allow-Origin",: "origin of frontend",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OSIsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20ifQ.PnkFEL4NnavgRkxON5BQSdOTpGHyCPcpt9FbAZOgJpo"
}
```

Cookies:

```JSON
{
  "newRefreshToken": {
    "httpOnly": true,
    "secure": true,
    "sameSite": true,
    "path": "/auth"
  }
}
```

---

### `/auth/logout`

**Method**: DELETE
**URL Params**: None
**Body**: None
**Cookies**: "refreshToken" (follows Bearer JWT token pattern)

Sample Reponse:

```JSON
{
  "success": "Successfully signed out"
}
```

- Clears the refresh cookie from the client

## How To Run

To run this service, run `npm install` and `npm run dev`. To build the TypeScript, you can use the `npm run build` command.

## Exceeding

In developing this service, there was a lot of difficulty encountered in designing how it should work, and making it as secure as we did. A simple cookie would have sufficed, similar to the Passport.js package, but a lot of research and trial and error was done to ensure that the best practices were followed. Therefore, both access and refresh tokens are accessed, and the frontend was then modified to request refresh tokens at an approriate interval. What this results in is a smooth user experience, as unless the user is completely inactive and does not open the site for more than 30 days, they will not be randomly logged out in between sessions unless they choose to do so. Because the refresh tokens are set to be HTTPonly, there is no way for anyone on the client to manipulate this token with Javascript. Therefore, the only way for one user to break into another user's account is if they have direct access to the user's machine when it is logged in. Since hidden env secrets are used to generate both of these tokens, we believe this system is very secure, and in line with how most systems go about it. In addition to this, when a new access token is generated, the refresh token is actually replaced, a practice known as "refresh token rotation". The refresh token for each user is tracked in a Redis database to ensure that there is no foul play in trying to access or request new access or refresh tokens.
