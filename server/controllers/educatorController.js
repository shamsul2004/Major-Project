import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import cloudinary from "../configs/cloudinary.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js"; // Assuming you have a User model

// ✅ 1. Update user role to educator
export const updateRoleToEducator = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Direct educator role update is disabled. Please submit an educator application first.',
  });
};

export const submitEducatorApplication = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const {
      experience,
      subjectExpertise,
      bio,
      phone,
      qualification,
      termsAccepted,
      additionalDetails,
    } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must accept the terms and conditions.' });
    }

    if (!experience || !subjectExpertise || !bio || !phone || !qualification) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.educatorApplication?.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Your educator application has already been approved.' });
    }

    user.educatorApplication = {
      status: 'pending',
      details: {
        experience,
        subjectExpertise,
        bio,
        phone,
        qualification,
        additionalDetails,
      },
      submittedAt: new Date(),
      reviewedAt: null,
      reviewer: '',
      rejectionReason: '',
    };

    await user.save();

    return res.json({ success: true, message: 'Application submitted successfully. Admin will review it shortly.', user });
  } catch (error) {
    console.error('submitEducatorApplication error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2. Add a new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail not attached' });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = req.auth.userId;

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    const newCourse = await Course.create(parsedCourseData);

    res.json({ success: true, message: 'Course added successfully', course: newCourse });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 3. Get all courses by educator
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 4. Educator dashboard data
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map(course => course._id);

    // Calculate total earnings from completed purchases
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    });

    const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);

    // Collect enrolled student data with course title
    const enrolledStudentsData = [];

    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudent } },
        'name imageUrl'
      );

      students.forEach(student => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          studentName: student.name,
          studentImage: student.imageUrl,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
        enrolledStudentsData,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 5. Get enrolled students with purchase data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    })
      .populate('userId', 'name imageUrl')
      .populate('courseId', 'courseTitle');

    const enrolledStudents = purchases.map(purchase => ({
      studentName: purchase.userId.name,
      studentImage: purchase.userId.imageUrl,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    const mediaFile = req.file;
    if (!mediaFile) {
      return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const uploadResult = await cloudinary.uploader.upload(mediaFile.path, {
      resource_type: 'auto',
    });

    res.json({
      success: true,
      url: uploadResult.secure_url,
      asset_id: uploadResult.asset_id,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId, educator });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId, educator });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { courseData } = req.body;
    const parsedCourseData = JSON.parse(courseData || '{}');

    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path);
      parsedCourseData.courseThumbnail = imageUpload.secure_url;
    }

    Object.assign(course, {
      courseTitle: parsedCourseData.courseTitle || course.courseTitle,
      courseDescription: parsedCourseData.courseDescription || course.courseDescription,
      coursePrice: parsedCourseData.coursePrice ?? course.coursePrice,
      discount: parsedCourseData.discount ?? course.discount,
      courseCategory: parsedCourseData.courseCategory || course.courseCategory,
      courseLevel: parsedCourseData.courseLevel || course.courseLevel,
      courseContent: parsedCourseData.courseContent || course.courseContent,
      isPublished: parsedCourseData.isPublished ?? course.isPublished,
    });

    await course.save();
    res.json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const { courseId } = req.params;
    const deleted = await Course.findOneAndDelete({ _id: courseId, educator });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Course not found or not owned by you' });
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
