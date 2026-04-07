import { Resend } from "resend";
import AppError from "./appError.js";

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) { 
    throw new AppError("API key is required to send emails", 500);  
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  if (!to || !subject || !html) {
    throw new AppError("Missing email fields", 400);
  }

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // default test sender
      to,
      subject,
      html,
    });

    console.log("Email sent:", response);
    return response;
  } catch (err) {
    console.log("Resend error:", err.message);
    throw new AppError("Email failed", 500);
  }
};
