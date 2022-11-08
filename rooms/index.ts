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
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue("number");
    channel.consume("test", (message) => {
      const input = JSON.parse(message!.content.toString());
      console.log(`Received number: ${input.test}`);
      channel.ack(message!);
    });
    console.log(`Waiting for messages...`);
  } catch (ex) {
    console.error(ex);
  }
}
connect();
