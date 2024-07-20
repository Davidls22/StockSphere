import express from 'express';
import { getAlerts, createAlert, deleteAlert } from '../controllers/alertController';

const router = express.Router();

router.get('/:userId', getAlerts);
router.post('/', createAlert);
router.delete('/:alertId', deleteAlert);

export default router;
