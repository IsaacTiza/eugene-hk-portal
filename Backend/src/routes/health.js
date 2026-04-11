import { Router } from "express";
import { sendEmail } from "../utils/email.js";

export const healthRouter = Router();

healthRouter.get("/health", (req, res) => {
    console.log('GET REQUEST')
res.status(200).json({
    status: "success",
    message: "WELCOME TO EUGENE HK-PORTAL API is healthy",
});
});

healthRouter.post("/health", (req, res) => {
    let message = req.body.message;
    if(message==='ping') message = 'pong'
  res.status(200).json({
    status: "success",
    message,
  });
});

healthRouter.get("/health/email", async (req, res) => {
  try {
    const emailDetails = await sendEmail({
      to: "i2493053@gmail.com",
      subject: "Test Email from HK-Portal API",
      html: "<p>This is a test email sent from the HK-Portal API health check endpoint.</p>",
    });
    console.log("Email sent successfully:", emailDetails);
    res.status(200).json({
      status: "success",
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send email"
    });
  }
})
