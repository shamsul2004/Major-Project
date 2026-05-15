import express from 'express'
import { getAllCourse,getCourseId } from '../controllers/courseController.js'

import { chatWithGemini, recommendCourses } from '../controllers/chatbotController.js'

const courseRouter =express.Router()

courseRouter.post('/chatbot', chatWithGemini)
courseRouter.post('/recommend', recommendCourses)
courseRouter.get('/all',getAllCourse)
courseRouter.get('/:id',getCourseId)

export default courseRouter

