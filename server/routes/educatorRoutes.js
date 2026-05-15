import express from 'express'
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  uploadMedia,
  getCourseById,
  updateCourse,
  deleteCourse,
  submitEducatorApplication,
} from '../controllers/educatorController.js'
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js'
import { requireAuth } from '@clerk/express'

const educatorRouter = express.Router()

educatorRouter.post('/apply', requireAuth(), submitEducatorApplication)
educatorRouter.get('/update-role', updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.post('/upload-media', upload.single('file'), protectEducator, uploadMedia)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/course/:courseId', protectEducator, getCourseById)
educatorRouter.put('/course/:courseId', upload.single('image'), protectEducator, updateCourse)
educatorRouter.delete('/course/:courseId', protectEducator, deleteCourse)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

export default educatorRouter;