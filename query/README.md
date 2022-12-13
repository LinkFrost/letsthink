**Owner:** Siddharth Raju

**Github:** sid2033

The query service is responsible for storing data related to mainly rooms. This data is used in the front-end as what the user will interact with. This service uses MongoDB to store all this relevant data.

This service listens for the majority of events. Whenever anything is created or updated (such as a room, user, vote), the query's database is updated to reflect this change.

This service has two endpoints. One endpoint to get the query data that is relevant to a room and one to get the query data that is relevant to a specific user.
