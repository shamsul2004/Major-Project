import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureId: { type: String, required: true },
  lectureDuration: { type: Number, required: true },
  lectureTitle: { type: String, required: true },
  lectureUrl: { type: String, required: true },
  isPreviewFree: { type: Boolean, required: true },
  lectureOrder: { type: Number, required: true }
});

const chapterSchema = new mongoose.Schema({
  chapterId: { type: String, required: true },
  chapterOrder: { type: Number, required: true },
  chapterTitle: { type: String, required: true },
  chapterContent: [lectureSchema]
});

const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  courseDescription: { type: String, required: true },
  courseThumbnail: { type: String },
  coursePrice: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value >= 0,
      message: 'Course price must be a positive number'
    }
  },
  courseCategory: { type: String, default: 'web-development' },
  courseLevel: { type: String, default: 'beginner' },
  isPublished: { type: Boolean, required: true },
  discount: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value >= 0 && value <= 100,
      message: 'Discount must be between 0 and 100'
    }
  },
  courseContent: [chapterSchema],
  courseRating: [{
    userId: { type: String },
    rating: { type: Number, min: 1, max: 5 }
  }],
  educator: {
    type: String,
    required: true,
    ref: 'User'
  },
  enrolledStudents: [{
    type: String,
    ref: 'User'
  }]
}, { timestamps: true, minimize: false });

const Course = mongoose.model('Course', courseSchema);
export default Course;
