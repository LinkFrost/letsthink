import * as dotenv from "dotenv";
dotenv.config();

import { RoomVisualized } from "../types/events.js";
import SendInBlue from "@sendinblue/client";

const API_KEY = process.env.SIB_API_KEY;
const SENDER_EMAIL = process.env.SIB_SENDER_EMAIL;
const SENDER_NAME = process.env.SIB_SENDER_NAME;

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
  mailInstance.subject = "";
  mailInstance.htmlContent = "";
  mailInstance.to = [];

  return {
    setSubject: function (roomTitle: string) {
      mailInstance.subject = `Room ${roomTitle} Visualized`;
      return this;
    },
    setHtmlContent: function (imageUrl: string) {
      mailInstance.htmlContent = `<html><body><h3>Here's a summary of your expired room:</h3><br/><img src="${imageUrl}"/></body></html>`;
      return this;
    },
    setRecipients: function (recipients: [{ name: string; email: string }]) {
      mailInstance.to = recipients;
      return this;
    },
    build: function () {
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
        .build();

      return await mailer
        .sendTransacEmail(currentMail)
        .then((d) => {
          console.log(`Email successfully sent.`);
          return data;
        })
        .catch((err) => {
          console.log(`Email unable to be sent.`);
          return false;
        });
    },
  };
};

export default sendInBlue;
