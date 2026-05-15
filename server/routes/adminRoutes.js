import express from 'express';
import { requireAuth } from '@clerk/express';
import { protectAdmin } from '../middlewares/authMiddleware.js';
import {
  getEducatorApplications,
  approveEducatorApplication,
  rejectEducatorApplication,
  getAdminDashboardData,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/educator-applications', requireAuth(), protectAdmin, getEducatorApplications);
adminRouter.post('/educator-applications/:userId/approve', requireAuth(), protectAdmin, approveEducatorApplication);
adminRouter.post('/educator-applications/:userId/reject', requireAuth(), protectAdmin, rejectEducatorApplication);
adminRouter.get('/dashboard', requireAuth(), protectAdmin, getAdminDashboardData);

export default adminRouter;
