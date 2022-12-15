**Owner:** Siddharth Raju

**Github:** [sid2023](https://github.com/sid2033)
---

## Description

The query service is responsible for storing data related to mainly users and rooms. This data is used in the front-end as what the user will interact with. This service uses MongoDB to store all this relevant data.

## Interactions

This service listens for the majority of events. Whenever anything is created or updated (such as a room, user, vote), the query's database is updated to reflect this change.

## Endpoints

This service has three endpoints. One endpoint to get the data that is relevant to a room, one to get all the room data that is relevant to a specific user, and one to get the information about a user.

### `/query/rooms/:room_id/`

**Method**: GET

**URL Params**: room_id

**Body**: None

### Sample Response

```JSON
{
    "_id": "6397f8e12132df282935b011",
    "expire_date": "2022-12-13T04:01:00.000Z",
    "id": "11de8772-35d0-4728-8f44-1465d7933649",
    "user_id": "46fc87e6-885c-445c-8ac3-b6f7c694b366",
    "title": "test",
    "about": "test",
    "room_type": "message",
    "duration": 1,
    "create_date": "2022-12-13T04:00:00.000Z",
    "expired": true,
    "messages": [
        {
            "id": "6a4ae49f-78cb-414c-b55c-69e960b97014",
            "room_id": "11de8772-35d0-4728-8f44-1465d7933649",
            "content": "test",
            "create_date": "2022-12-13T04:00:38.505Z",
            "votes": 1
        },
        {
            "id": "b6a5d687-a563-4365-9cf7-987db5dc8eaa",
            "room_id": "11de8772-35d0-4728-8f44-1465d7933649",
            "content": "fadsfsda",
            "create_date": "2022-12-13T04:00:40.270Z",
            "votes": 1
        }
    ]
}
```

### `/query/rooms/user/:user_id/`

**Method**: GET

**URL Params**: user_id

**Body**: None

### Sample Response

```JSON
[

    {
        "_id": "6397f8e12132df282935b014",
        "expire_date": "2022-12-13T04:01:00.000Z",
        "id": "11de8772-35d0-4728-8f44-1465d7933649",
        "user_id": "46fc87e6-885c-445c-8ac3-b6f7c694b366",
        "title": "test",
        "about": "test",
        "room_type": "message",
        "duration": 1,
        "create_date": "2022-12-13T04:00:00.000Z",
        "expired": true,
        "messages": [
            {
                "id": "6a4ae49f-78cb-414c-b55c-69e960b97014",
                "room_id": "11de8772-35d0-4728-8f44-1465d7933649",
                "content": "test",
                "create_date": "2022-12-13T04:00:38.505Z",
                "votes": 1
            }
        ]
    },
    {
        "_id": "6397fa652132df282935b015",
        "expire_date": "2022-12-13T04:08:00.000Z",
        "id": "3e526353-8ba2-43e0-a107-b6793bf3a6e0",
        "user_id": "46fc87e6-885c-445c-8ac3-b6f7c694b366",
        "title": "tester",
        "about": "1",
        "room_type": "message",
        "duration": 1,
        "create_date": "2022-12-13T04:07:00.000Z",
        "expired": true,
        "messages": [
            {
                "id": "62bcf84f-5c39-4d58-941a-52a5f459cc3e",
                "room_id": "3e526353-8ba2-43e0-a107-b6793bf3a6e0",
                "content": "test1",
                "create_date": "2022-12-13T04:07:09.390Z",
                "votes": 1
            },
            {
                "id": "c2b37f7b-a3ab-4fd1-ba26-b587046b54ba",
                "room_id": "3e526353-8ba2-43e0-a107-b6793bf3a6e0",
                "content": "test2",
                "create_date": "2022-12-13T04:07:12.819Z",
                "votes": 1
            }
        ]
    }
]
```

### `/query/users/:user_id/`

**Method**: GET

**URL Params**: user_id

**Body**: None

### Sample Response

```JSON
{
    "_id": "6397f8bd2132df282935b013",
    "id": "46fc87e6-885c-445c-8ac3-b6f7c694b366",
    "username": "test1",
    "email": "test1@gmail.com"
}
```

## How to Run

To run this service, run `npm install` and `npm run dev`. To build the typescript, you can use the `npm run build` command.

## Exceeding

I learned how to use MongoDB for the purpose of this project and have now become familiar with the setup and integration of MongoDB instances. This includes the setup and CRUD operations related to various databases, collections, and documents.
