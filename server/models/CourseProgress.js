// models/CourseProgress.js
import mongoose from "mongoose";
import Course from "./Course.js";

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // or mongoose.Schema.Types.ObjectId if you use ObjectId for users
      required: true,
      ref: "User",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    completedLectures: [
      {
        type: String,
      },
    ],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
export default CourseProgress;


export const rateCourse = async (req, res) => {
  const userId = req.auth?.userId;
  const { courseId, rating } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Initialize if undefined
    if (!course.courseRating) {
      course.courseRating = [];
    }

    const existingRating = course.courseRating.find(r => r.userId === userId);

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      course.courseRating.push({ userId, rating });
    }

    await course.save();
    res.status(200).json({ success: true, message: "Rating updated successfully", course });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAverageRating = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (!course.courseRating || course.courseRating.length === 0) {
      return res.status(200).json({ success: true, averageRating: 0 });
    }

    const ratings = course.courseRating.map(r => r.rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    res.status(200).json({ success: true, averageRating: avgRating.toFixed(1) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};