import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (req, res) => {
    console.log('GET REQUEST')
  res.status(200).json({
    status: "success",
    message: "API is healthy",
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
