import mongoose from "mongoose";

//connect to mongodb database
const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ Database Connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ Database Connection Error: ${err.message}`);
  });

  let uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  // Check for placeholder password
  if (uri.includes('<db_password>')) {
    console.warn('⚠️ WARNING: You have not replaced <db_password> in your .env file.');
    console.warn('⚠️ Falling back to local MongoDB if available...');
    uri = 'mongodb://localhost:27017/edemy_learnify';
  }

  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    if (uri.startsWith('mongodb+srv')) {
      console.error('👉 Make sure your IP is whitelisted in MongoDB Atlas and your password is correct.');
    }
    // Don't exit process in dev mode to allow user to see error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB
