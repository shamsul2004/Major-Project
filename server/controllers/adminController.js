import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";

const getEmailFromUser = (user) => {
  return user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || '';
};

export const getEducatorApplications = async (req, res) => {
  try {
    const applications = await User.find({ 'educatorApplication.status': 'pending' }).select(
      'name email imageUrl educatorApplication role'
    );

    res.json({ success: true, applications });
  } catch (error) {
    console.error('getEducatorApplications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveEducatorApplication = async (req, res) => {
  try {
    const adminId = req.auth.userId;
    const { userId } = req.params;

    const applicant = await User.findById(userId);
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found.' });
    }

    if (applicant.educatorApplication?.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application is not pending.' });
    }

    applicant.role = 'educator';
    applicant.educatorApplication.status = 'approved';
    applicant.educatorApplication.reviewedAt = new Date();
    applicant.educatorApplication.reviewer = adminId;
    await applicant.save();

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'educator',
      },
    });

    res.json({ success: true, message: 'Educator application approved.', applicant });
  } catch (error) {
    console.error('approveEducatorApplication error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectEducatorApplication = async (req, res) => {
  try {
    const adminId = req.auth.userId;
    const { userId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const applicant = await User.findById(userId);
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found.' });
    }

    if (applicant.educatorApplication?.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application is not pending.' });
    }

    applicant.educatorApplication.status = 'rejected';
    applicant.educatorApplication.reviewedAt = new Date();
    applicant.educatorApplication.reviewer = adminId;
    applicant.educatorApplication.rejectionReason = rejectionReason;
    await applicant.save();

    res.json({ success: true, message: 'Educator application rejected.', applicant });
  } catch (error) {
    console.error('rejectEducatorApplication error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    
    const purchaseStats = await Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalOrders: { $count: {} } } }
    ]);

    const totalRevenue = purchaseStats.length > 0 ? purchaseStats[0].totalRevenue : 0;
    const totalOrders = purchaseStats.length > 0 ? purchaseStats[0].totalOrders : 0;

    // Monthly revenue (simplified mock for now but based on real count)
    const monthlyRevenue = await Purchase.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const lineChartData = monthlyRevenue.map(item => ({
      name: monthNames[item._id - 1],
      revenue: item.revenue,
      users: item.count * 2 // Just for visual
    }));

    const categoryStats = await Course.aggregate([
      { $group: { _id: "$courseCategory", count: { $sum: 1 } } }
    ]);

    const barChartData = categoryStats.map(item => ({
      name: item._id,
      students: item.count * 50 // Scaling for visual
    }));

    res.json({
      success: true,
      dashboardData: {
        totalUsers,
        totalCourses,
        totalRevenue,
        totalOrders,
        lineChartData: lineChartData.length > 0 ? lineChartData : [
          { name: 'Jan', revenue: 0, users: 0 },
          { name: 'Feb', revenue: 0, users: 0 }
        ],
        barChartData: barChartData.length > 0 ? barChartData : [
          { name: 'None', students: 0 }
        ]
      }
    });
  } catch (error) {
    console.error('getAdminDashboardData error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
