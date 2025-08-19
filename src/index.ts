import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});