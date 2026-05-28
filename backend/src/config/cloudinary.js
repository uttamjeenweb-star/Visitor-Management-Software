import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import logger from '../utils/logger.utils.js';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - The image buffer to upload
 * @param {String} folder - The folder in Cloudinary to store the image
 * @returns {Promise<Object>} The Cloudinary upload result
 */
export const uploadImage = (buffer, folder = 'create-pass') => {
  return new Promise((resolve, reject) => {
    if (!buffer) return reject(new Error('No buffer provided'));
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID
 * @param {String} publicId - The public ID of the image
 * @returns {Promise<Object>} The Cloudinary deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted image from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error(`Failed to delete image from Cloudinary: ${error.message}`);
    throw error;
  }
};
