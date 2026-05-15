import express from 'express'

import { getCourseProgress, getUserData,markLectureComplete,purchaseCourse,userEnrolledCourses, deleteEnrollment, getInvoice, verifyPayment } from '../controllers/userController.js'
import { getAverageRating, rateCourse } from '../models/CourseProgress.js'
import { syncUser } from '../controllers/syncUser.js'
import { requireAuth } from '@clerk/express'


const userRouter = express.Router()

userRouter.post('/sync-user', requireAuth(), syncUser)
userRouter.get('/data', requireAuth(), getUserData)
userRouter.get('/enrolled-courses', requireAuth(), userEnrolledCourses)
userRouter.post('/purchase', requireAuth(), purchaseCourse)
userRouter.post('/verify-payment', requireAuth(), verifyPayment)
userRouter.post('/delete-enrollment', requireAuth(), deleteEnrollment)
userRouter.get('/invoice/:purchaseId', requireAuth(), getInvoice)
userRouter.post("/mark-complete", requireAuth(), markLectureComplete);
userRouter.get("/:courseId", requireAuth(), getCourseProgress);
userRouter.post("/get-course-progress", requireAuth(), getCourseProgress);
userRouter.post("/rate", requireAuth(), rateCourse);
userRouter.get("/average/:courseId", getAverageRating);



export default userRouter;