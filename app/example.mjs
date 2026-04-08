import twilio from "twilio";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const message = await client.messages.create({
  from: process.env.TWILIO_WHATSAPP_FROM,
  contentSid: process.env.TWILIO_TEMPLATE_SID,
  contentVariables: JSON.stringify({
    1: "abc123",
    2: "Nahuel Mileo",
    3: "+59899874242",
    4: "nahuel@gmail.com",
    5: "Kit 3 imanes",
  }),
  to: process.env.TWILIO_WHATSAPP_TO,
});

console.log("SID:", message.sid);
console.log("Status:", message.status);
