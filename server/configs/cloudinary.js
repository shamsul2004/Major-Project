import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

dotenv.config()

const cloudinaryName = process.env.CLOUDINARY_NAME
const cloudinaryKey = process.env.CLOUDINARY_API_KEY
const cloudinarySecret = process.env.CLOUDINARY_SECRET_KEY

if (!cloudinaryName || !cloudinaryKey || !cloudinarySecret) {
  throw new Error('Cloudinary configuration is missing. Set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY in server/.env or environment variables.')
}

cloudinary.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryKey,
  api_secret: cloudinarySecret,
})

export default cloudinary