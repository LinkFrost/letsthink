import initExpress from "./utils/init/initExpress.js";
import initMongo from "./utils/init/initMongo.js";
import { moderate } from "./utils/moderate.js";
import banned_json from "./utils/banned.json" assert { type: "json" };

const queue = "moderator";

// init third party services
const app = initExpress(4004);
const [mongoAcceptedMessages, mongoRejectedMessages, mongoBannedWords] = await initMongo("moderator", [
  "accepted-messages",
  "rejected-messages",
  "banned-words",
]);

let BANNED_WORDS = (await mongoBannedWords.find().toArray()).map((word) => word.word);

if (!BANNED_WORDS?.length) {
  await mongoBannedWords.insertMany(banned_json.map((word) => ({ word })));
}

// helper functions
// store moderated message in mongo
const storeModeratedMessage = async (message: string, rejected: boolean, invalidWords: string[]) => {
  if (rejected) {
    return await mongoRejectedMessages.insertOne({ message, invalidWords });
  } else {
    return await mongoAcceptedMessages.insertOne({ message });
  }
};

// basic express route
app.get("/", (req, res) => {
  res.send("Moderator service");
});

// post request to test moderating a message
app.post("/moderate", async (req, res) => {
  const { message } = req.body;

  const { wasRejected, invalidWords } = moderate(BANNED_WORDS, message);

  await storeModeratedMessage(message, wasRejected, invalidWords);

  res.send({ status: wasRejected ? "rejected" : "accepted", invalidWords });
});
