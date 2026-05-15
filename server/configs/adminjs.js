import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import AdminJSExpress from '@adminjs/express';

// Import Mongoose models
import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import CourseProgress from '../models/CourseProgress.js';

// Register the mongoose adapter
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const navigation = { name: 'Learnify' };

// Setup AdminJS instance
const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        navigation,
        properties: {
          clerkId: { isVisible: { list: false, filter: false, show: true, edit: false } },
          'educatorApplication.details': { isVisible: false }, // Hide the raw mixed object
          // Explicitly map the fields inside details so they show up beautifully
          'educatorApplication.details.experience': { type: 'textarea', isVisible: { list: false, show: true, edit: true } },
          'educatorApplication.details.subjectExpertise': { type: 'textarea', isVisible: { list: false, show: true, edit: true } },
          'educatorApplication.details.bio': { type: 'textarea', isVisible: { list: false, show: true, edit: true } },
          'educatorApplication.details.phone': { type: 'string', isVisible: { list: false, show: true, edit: true } },
          'educatorApplication.details.qualification': { type: 'string', isVisible: { list: false, show: true, edit: true } },
          'educatorApplication.details.additionalDetails': { type: 'textarea', isVisible: { list: false, show: true, edit: true } },
        },
        actions: {
          approveApplication: {
            actionType: 'record',
            icon: 'Check',
            component: false,
            isVisible: (context) => {
              if (!context.record || !context.record.params) return false;
              return context.record.params['educatorApplication.status'] === 'pending';
            },
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              const user = await User.findById(record.params._id);
              if (user) {
                user.role = 'educator';
                user.educatorApplication.status = 'approved';
                await user.save();
              }
              return {
                record: record.toJSON(currentAdmin),
                notice: { message: 'Application Approved Successfully! User is now an Educator.', type: 'success' },
              };
            },
          },
          rejectApplication: {
            actionType: 'record',
            icon: 'X',
            component: false,
            isVisible: (context) => {
              if (!context.record || !context.record.params) return false;
              return context.record.params['educatorApplication.status'] === 'pending';
            },
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              const user = await User.findById(record.params._id);
              if (user) {
                user.educatorApplication.status = 'rejected';
                user.educatorApplication.rejectionReason = 'Rejected by admin';
                await user.save();
              }
              return {
                record: record.toJSON(currentAdmin),
                notice: { message: 'Application Rejected.', type: 'error' },
              };
            },
          }
        }
      }
    },
    {
      resource: Course,
      options: { navigation },
    },
    {
      resource: Purchase,
      options: { navigation },
    },
    {
      resource: CourseProgress,
      options: { navigation },
    }
  ],  locale: {
    language: 'en',
    translations: {
      labels: {
        Learnify: 'Learnify',
        User: 'User',
        Course: 'Course',
        Purchase: 'Purchase',
        CourseProgress: 'Course Progress',
      },
      resources: {
        User: {
          name: 'User',
          name_plural: 'Users',
        },
        Course: {
          name: 'Course',
          name_plural: 'Courses',
        },
        Purchase: {
          name: 'Purchase',
          name_plural: 'Purchases',
        },
        CourseProgress: {
          name: 'Course Progress',
          name_plural: 'Course Progresses',
        },
      },
    },
  },  rootPath: '/admin-panel',
  branding: {
    companyName: 'Learnify LMS Admin',
    softwareBrothers: false, // hide "AdminJS" logo at bottom
    logo: false,
  },
});

// Build the router (we can build an authenticated router later, for now just basic)
const adminRouter = AdminJSExpress.buildRouter(adminJs);

export { adminJs, adminRouter };
