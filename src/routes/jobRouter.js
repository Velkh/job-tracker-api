import { Router } from 'express';
import { getJobs, createJob } from '../controllers/jobController.js'; // Wajib pakai .js

const router = Router();

router.get('/', getJobs);
router.post('/', createJob);

export default router;