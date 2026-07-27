require("dotenv").config({path: ".env.local"});
const { Resend } = require("resend");
const r = new Resend(process.env.RESEND_API_KEY);
r.emails.get("3f11263c-4987-44ec-aae9-d411a37315b4").then(res => {
  console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
