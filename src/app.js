import express from 'express';
import { healthRouter } from './routes/health.js';

const app = express();

//MIDDLEWARES
app.use(express.json());


//ROUTES
app.use('/hk-portal/v1',healthRouter)

export default app;