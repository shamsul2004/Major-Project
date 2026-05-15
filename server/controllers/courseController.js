import Course from "../models/Course.js";


export const getCourseId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.json({ success: false, message: "Course ID missing" });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    //  Ensure courseContent is an array
    if (!course.courseContent) {
      course.courseContent = [];
    }

    return res.json({ success: true, courseData: course });
  } catch (error) {
    console.error("getCourseId Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};



export const getAllCourse = async (req, res) => {
  try {
    // Sare courses fetch karo (only published)
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });

    if (!courses || courses.length === 0) {
      return res.status(200).json({ success: true, courses: [] });
    }

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get All Courses Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};