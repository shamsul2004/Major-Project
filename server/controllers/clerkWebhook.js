import { Webhook } from 'svix';
import User from '../models/User.js';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';
import dotenv from 'dotenv';
import { sendPaymentSuccessEmail, generateInvoiceHTML } from '../utils/emailService.js';



dotenv.config();
const formatUserData = (data) => {
  const email = data.email_addresses?.[0]?.email_address || '';
  const rawAdminEmails = process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '';
  const adminEmails = rawAdminEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isEmailAdmin = email && adminEmails.includes(email.toLowerCase());

  return {
    _id: data.id,                     // This will act as MongoDB document _id
    clerkId: data.id,                // Required for querying with clerkId
    email,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    imageUrl: data.image_url || '',
    enrolledCourses: [],            // Ensure empty array initially
    ...(isEmailAdmin && { role: 'admin', isAdmin: true })
  };
};
export const clerkWebhookHandler = async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const payload = req.body;
  const headers = req.headers;

  try {
    const wh = new Webhook(secret);
    const evt = wh.verify(payload, {
      'svix-id': headers['svix-id'],
      'svix-timestamp': headers['svix-timestamp'],
      'svix-signature': headers['svix-signature'],
    });

    console.log(' Clerk webhook hit received');

    const { data, type } = evt;

    switch (type) {
      case 'user.created': {
        const userData = formatUserData(data);

        //  Agar user exist nahi hai to create karo
        const existingUser = await User.findById(data.id);
        if (!existingUser) {
          await User.create(userData);
          console.log('✅ User created via webhook:', userData.email);
        } else {
          console.log('ℹUser already exists, skipping creation');
        }
        break;
      }

      case 'user.updated': {
        const userData = formatUserData(data);
        // Only update fields explicitly provided in userData. This prevents overwriting roles unnecessarily.
        await User.findByIdAndUpdate(data.id, { $set: userData }, { new: true, upsert: true });
        console.log('✅ User updated via webhook:', userData.email);
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        console.log(' User deleted via webhook:', data.id);
        break;
      }

      default:
        console.log('ℹUnhandled webhook type:', type);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(' Webhook Error:', err.message);
    return res.status(400).json({ error: 'Invalid webhook' });
  }
};



const stripeInstance = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const stripeWebhooks = async (req, res) => {
  if (!stripeInstance) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(' Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Signature verified, handle event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        // Get the session using the payment intent
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!sessions.data || sessions.data.length === 0) {
          console.error(' No session found for payment intent:', paymentIntentId);
          break;
        }

        const session = sessions.data[0];
        const { purchaseId, userId, courseId } = session.metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!purchaseData || !userData || !courseData) {
          console.error(' Missing data for purchase completion:', { purchaseId, userId, courseId });
          break;
        }

        // Record payment method information
        const paymentMethod = session.payment_method_types[0] || 'card';
        purchaseData.paymentMethod = paymentMethod;
        purchaseData.stripePaymentIntentId = paymentIntentId;

        // Avoid duplicate pushes
        if (!courseData.enrolledStudents.some(id => id.toString() === userData._id.toString())) {
          courseData.enrolledStudents.push(userData._id);
        }
        if (!userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
          userData.enrolledCourses.push(courseData._id);
        }

        await courseData.save();
        await userData.save();

        purchaseData.status = 'completed';
        await purchaseData.save();

        // Send payment success email
        try {
          await sendPaymentSuccessEmail(
            userData.email,
            userData.name,
            courseData.courseTitle,
            purchaseData.amount,
            purchaseData._id.toString()
          );
        } catch (emailError) {
          console.error('Email sending failed:', emailError.message);
        }

        console.log(` Payment succeeded for user ${userId} on course ${courseId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (sessions.data && sessions.data.length > 0) {
          const { purchaseId } = sessions.data[0].metadata;
          const purchaseData = await Purchase.findById(purchaseId);

          if (purchaseData) {
            purchaseData.status = 'failed';
            purchaseData.stripePaymentIntentId = paymentIntentId;
            await purchaseData.save();
          }
        }

        console.log(' Payment failed:', paymentIntentId);
        break;
      }

      default:
        console.log(`ℹ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(' Error handling webhook event:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
