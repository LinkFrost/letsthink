import { RoomVisualized } from "./events.js";
import SendInBlue from "@sendinblue/client";

const API_KEY = process.env.SIB_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_NAME = process.env.SENDER_NAME;

if (!API_KEY || !SENDER_EMAIL || !SENDER_NAME) {
  throw new Error("Missing environment variables");
}

const initSendInBlue = () => {
  const mailer = new SendInBlue.TransactionalEmailsApi();
  const getEmailInstance = () => new SendInBlue.SendSmtpEmail();

  mailer.setApiKey(SendInBlue.TransactionalEmailsApiApiKeys.apiKey, API_KEY);

  return { mailer, getEmailInstance };
};

const buildEmail = (mailInstance: SendInBlue.SendSmtpEmail) => {
  mailInstance.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

  return {
    setSubject: function (roomTitle: string) {
      mailInstance.subject = `Room ${roomTitle} Visualized`;
      return this;
    },
    setHtmlContent: function (imageUrl: string) {
      mailInstance.htmlContent = `<html><body><h3>Here's a summary of your requested room:</h3><br/><img src="${imageUrl}"/></body></html>`;
      return this;
    },
    setRecipients: function (recipients: [{ name: string; email: string }]) {
      mailInstance.to = recipients;
      return this;
    },
    built: function () {
      return mailInstance;
    },
  };
};

const sendInBlue = async () => {
  const { mailer, getEmailInstance } = initSendInBlue();

  return {
    sendEmail: async (data: RoomVisualized["data"]) => {
      const currentMail = buildEmail(getEmailInstance())
        .setSubject(data.title)
        .setHtmlContent(data.imageUrl)
        .setRecipients([{ name: data.username, email: data.user_email }])
        .built();

      return await mailer
        .sendTransacEmail(currentMail)
        .then((d) => {
          console.log(`API called successfully. Returned data: ${JSON.stringify(d)}`);
          return data;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    },
  };
};

export default sendInBlue;
