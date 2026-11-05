import { Router } from 'express';
import { getJobs, createJob, getJobById, updateJob, updateJobStatus, getSummaryStats, deleteJob} from '../controllers/jobController.js'; 
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = Router();

router.use(authenticateToken);

router.get('/stats', getSummaryStats);
router.get('/', getJobs);
router.post('/',createJob);

router.get('/:id', getJobById);
router.patch('/:id', updateJob);
router.put('/:id/status', updateJobStatus);
router.delete('/:id', deleteJob);


export default router;