import initRabbit from "./utils/init/initRabbit.js";
import initExpress from "./utils/init/initExpress.js";
import initMongo from "./utils/init/initMongo.js";
import { moderate } from "./utils/moderate.js";

const queue = "moderator";

// init third party services
const { eventBusChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);
const server = initExpress(4004);
const [mongoAcceptedMessages, mongoRejectedMessages, mongoBannedWords] = await initMongo("moderator", [
  "accepted-messages",
  "rejected-messages",
  "banned-words",
]);

let BANNED_WORDS = (await mongoBannedWords.find().toArray()).map((word) => word.word);

// helper functions
// store moderated message in mongo
const storeModeratedMessage = async (message: string, rejected: boolean, invalidWords: string[]) => {
  if (rejected) {
    return await mongoRejectedMessages.insertOne({ message, invalidWords });
  } else {
    return await mongoAcceptedMessages.insertOne({ message });
  }
};

// Listen for incoming messages
eventBusChannel.consume(queue, (message) => {
  if (!message) return;

  const { key, data } = JSON.parse(message.content.toString());

  console.log(`Received event of type ${key}`);

  switch (key) {
    default:
    // Insert logic for various events here depending on the type and data
    // Case for each event type
  }

  eventBusChannel.ack(message);
});

// basic express route
server.get("/", (req, res) => {
  res.send("Moderator service");
});

// post request to test moderating a message
server.post("/moderate", async (req, res) => {
  const { message } = req.body;

  const { rejected, invalidWords } = moderate(BANNED_WORDS, message);

  await storeModeratedMessage(message, rejected, invalidWords);

  res.send({ status: rejected ? "rejected" : "accepted", invalidWords });
});
