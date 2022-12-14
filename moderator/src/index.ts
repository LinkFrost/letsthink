import initExpress from "./utils/init/initExpress.js";
import initMongo from "./utils/init/initMongo.js";
import { moderate } from "./utils/moderate.js";
import banned_json from "./utils/banned.json" assert { type: "json" };

// SETUP
// config
const mongoConfig = {
  db: "moderator",
  collections: ["acceptedMessages", "rejectedMessages", "bannedWords"],
};

// initialize third party services
const server = initExpress(4004);
const [mongoAcceptedMessages, mongoRejectedMessages, mongoBannedWords] = await initMongo(mongoConfig.db, mongoConfig.collections);

// HELPER FUNCTIONS
// store moderated message in mongo
const storeModeratedMessage = async (message: string, rejected: boolean, invalidWords: string[]) => {
  if (rejected) {
    return await mongoRejectedMessages.insertOne({ message, invalidWords });
  } else {
    return await mongoAcceptedMessages.insertOne({ message });
  }
};

// handle banned words insertion
const initBannedWords = async () => {
  const readBannedWords = async () => (await mongoBannedWords.find().toArray()).map((word) => word.word);

  let bannedWordsFromDb = await readBannedWords();

  if (!bannedWordsFromDb?.length) {
    await mongoBannedWords.insertMany(banned_json.map((word) => ({ word })));
    bannedWordsFromDb = await readBannedWords();
  }

  return bannedWordsFromDb;
};

const BANNED_WORDS = await initBannedWords();

// HTTP SERVER
// basic express route
server.get("/", (req, res) => {
  res.send("Moderator service");
});

// post request to test moderating a message
server.post("/moderate", async (req, res) => {
  const { message } = req.body;

  const { wasRejected, invalidWords } = moderate(BANNED_WORDS, message);

  await storeModeratedMessage(message, wasRejected, invalidWords);

  res.send({ status: wasRejected ? "rejected" : "accepted", invalidWords });
});
