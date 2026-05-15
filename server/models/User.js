import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String, // allow string ID (Clerk's user ID)
            required: true,
        },
        clerkId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
        },
        imageUrl: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['student', 'educator', 'admin', 'user'],
            default: 'user',
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        educatorApplication: {
            status: {
                type: String,
                enum: ['none', 'pending', 'approved', 'rejected'],
                default: 'none',
            },
            details: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            submittedAt: {
                type: Date,
            },
            reviewedAt: {
                type: Date,
            },
            reviewer: {
                type: String,
                default: '',
            },
            rejectionReason: {
                type: String,
                default: '',
            },
        },
        enrolledCourses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',  // Reference to the 'Course' model
            required: false, // If courses are optional, keep it as false
        }],
    },
    { timestamps: true }
);

// Create the model
const User = mongoose.model('User', userSchema);

export default User;
