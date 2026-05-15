import User from "../models/User.js"
import { Purchase } from "../models/Purchase.js"
import Stripe from "stripe"
import Course from "../models/Course.js"
import CourseProgress from "../models/CourseProgress.js"
import { generateInvoiceHTML, sendPaymentSuccessEmail } from "../utils/emailService.js"

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    const rawAdminEmails = process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '';
    const adminEmails = rawAdminEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const isEmailAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

    let isModified = false;
    if (isEmailAdmin && user.role !== 'admin') {
      user.role = 'admin';
      user.isAdmin = true;
      isModified = true;
    } else if (!isEmailAdmin && user.role === 'admin') {
      user.role = 'user'; // fallback for removed admins
      user.isAdmin = false;
      isModified = true;
    }

    if (isModified) {
      await user.save();
    }

    res.json({ success: true, user })

  } catch (error) {
    res.json({ success: false, message: error.message })


  }
}

//user enrolled courses with lecture links

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId
    const userData = await User.findById(userId)

    if (!userData) {
      return res.json({ success: false, message: 'User not found' })
    }

    // Sync enrollments from Purchase collection to ensure "Every course... must always appear"
    const completedPurchases = await Purchase.find({ userId, status: 'completed' });
    const purchasedCourseIds = completedPurchases.map(p => p.courseId.toString());

    let isModified = false;
    const currentEnrolledIds = userData.enrolledCourses.map(id => id.toString());

    // Add missing purchases to enrolledCourses array
    purchasedCourseIds.forEach(id => {
      if (!currentEnrolledIds.includes(id)) {
        userData.enrolledCourses.push(id);
        isModified = true;
      }
    });

    // Deduplicate enrolledCourses array to fix "Cyber Security Basics appearing twice"
    const uniqueIds = [...new Set(userData.enrolledCourses.map(id => id.toString()))];
    if (uniqueIds.length !== userData.enrolledCourses.length) {
      userData.enrolledCourses = uniqueIds;
      isModified = true;
    }

    if (isModified) {
      await userData.save();
    }

    const populatedUser = await User.findById(userId).populate('enrolledCourses')
    res.json({ success: true, enrolledCourses: populatedUser.enrolledCourses })

  } catch (error) {
    res.json({ success: false, message: error.message })

  }
}

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth?.userId;

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      console.log(" ERROR: userData or courseData not found");
      return res.json({ success: false, message: 'Data not found' });
    }

    // Check if user already purchased this course
    const existingPurchase = await Purchase.findOne({
      courseId: courseData._id,
      userId,
      status: 'completed'
    });

    if (existingPurchase) {
      return res.json({
        success: false,
        message: 'You have already purchased this course'
      });
    }

    // Check if user is already enrolled (for free courses or completed purchases)
    if (userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
      return res.json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const amount = Math.round(
      (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100) * 100
    ); // in cents

    if (amount === 0) {
      // Free course - enroll directly
      if (!courseData.enrolledStudents.some(id => id.toString() === userData._id.toString())) {
        courseData.enrolledStudents.push(userData._id);
      }
      if (!userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
        userData.enrolledCourses.push(courseData._id);
      }
      await courseData.save();
      await userData.save();

      const newPurchase = await Purchase.create({
        courseId: courseData._id,
        userId,
        amount: 0,
        status: 'completed',
      });

      return res.json({ success: true, newPurchase, message: "Enrolled successfully" });
    }

    // For paid courses, initiate Stripe session
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount: amount / 100, // store in dollars
      status: 'pending',
      paymentMethod: 'card', // default to card, will be updated by webhook if UPI
    });

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: courseData.courseTitle,
            },
            unit_amount: amount, // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/loading/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId,
        courseId: courseData._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (err) {
    console.error(" Purchase error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




export const markLectureComplete = async (req, res) => {
  const { courseId, lectureId } = req.body;

  try {
    const userId = req.auth.userId;
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLectures: [lectureId],
      });
    } else {
      if (!progress.completedLectures.includes(lectureId)) {
        progress.completedLectures.push(lectureId);
        progress.lastAccessed = Date.now();
        await progress.save();
      }
    }

    res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error("Error updating course progress", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const courseId = req.params.courseId || req.body.courseId;

    const progress = await CourseProgress.findOne({ userId, courseId });
    res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error("Error fetching course progress", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth?.userId;

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: 'Data not found' });
    }

    // Remove course from user's enrolled courses
    userData.enrolledCourses = userData.enrolledCourses.filter(
      id => id.toString() !== courseId
    );

    // Remove user from course's enrolled students
    courseData.enrolledStudents = courseData.enrolledStudents.filter(
      id => id.toString() !== userId
    );

    // Delete course progress
    await CourseProgress.findOneAndDelete({ userId, courseId });

    // Note: We don't delete the purchase record as it's needed for financial records

    await userData.save();
    await courseData.save();

    res.json({ success: true, message: 'Course removed from your enrollments' });
  } catch (err) {
    console.error("Delete enrollment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const userId = req.auth?.userId;

    const purchase = await Purchase.findById(purchaseId).populate('courseId');
    const user = await User.findById(userId);

    if (!purchase || !user) {
      return res.json({ success: false, message: 'Purchase not found' });
    }

    // Check if user owns this purchase
    if (purchase.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    // Check if payment was completed
    if (purchase.status !== 'completed') {
      return res.json({ success: false, message: 'Invoice not available for pending payments' });
    }

    const invoiceHTML = generateInvoiceHTML(
      user.name,
      purchase.courseId.courseTitle,
      purchase.amount,
      purchase._id.toString(),
      purchase.paymentMethod
    );

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${purchaseId}.html"`);
    res.send(invoiceHTML);
  } catch (err) {
    console.error("Get invoice error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.auth?.userId;

    if (!sessionId || !userId) {
      return res.json({ success: false, message: 'Missing sessionId or userId' });
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.json({ success: false, message: 'Payment not completed' });
    }

    const { purchaseId, courseId } = session.metadata;

    const purchaseData = await Purchase.findById(purchaseId);
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!purchaseData || !userData || !courseData) {
      return res.json({ success: false, message: 'Data not found' });
    }

    if (purchaseData.status === 'completed') {
      return res.json({ success: true, message: 'Payment already verified' });
    }

    // Update DB
    purchaseData.status = 'completed';
    purchaseData.paymentMethod = session.payment_method_types?.[0] || 'card';
    purchaseData.stripePaymentIntentId = session.payment_intent;

    if (!courseData.enrolledStudents.some(id => id.toString() === userData._id.toString())) {
      courseData.enrolledStudents.push(userData._id);
    }
    if (!userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
      userData.enrolledCourses.push(courseData._id);
    }

    await courseData.save();
    await userData.save();
    await purchaseData.save();

    // Send Email
    try {
      await sendPaymentSuccessEmail(
        userData.email,
        userData.name,
        courseData.courseTitle,
        purchaseData.amount,
        purchaseData._id.toString()
      );
    } catch (emailError) {
      console.error('Email sending failed in verify:', emailError.message);
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};