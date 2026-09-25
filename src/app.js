import express from 'express';
import jobRoutes from './routes/jobRouter.js';

const app = express();

app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(express.json());
app.use('/api/jobs', jobRoutes);

export default app;