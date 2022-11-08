import amqplib from "amqplib";

// console.log("HI");

// amqplib.connect("amqp://localhost", function (error0: any, connection: any) {
//   if (error0) {
//     throw error0;
//   }

//   console.log("HERE");

//   connection.createChannel(function (error1: any, channel: any) {
//     if (error1) {
//       throw error1;
//     }

//     let queue = "test";
//     let msg = "Hello world";

//     channel.assertQueue(queue, {
//       durable: false,
//     });

//     channel.sendToQueue(queue, Buffer.from(msg));
//     console.log(" [x] Sent %s", msg);
//   });
// });

async function connect() {
  // const msgBuffer = Buffer.from(JSON.stringify({ number: Math.floor(Math.random() * 10) }));
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue("test");

    return { connection, channel };
    // await channel.sendToQueue("number", msgBuffer);
    // console.log("Sending message to number queue");
    // await channel.close();
    // await connection.close();
  } catch (ex) {
    console.error(ex);
  }
}

let { connection, channel } = (await connect()) ?? {};

channel?.sendToQueue("test", Buffer.from(JSON.stringify({ test: "Hello there" })));
