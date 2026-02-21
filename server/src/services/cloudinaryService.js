const cloudinary = require('../config/cloudinary');
const fs = require('fs');

class CloudinaryService {
    /**
     * Upload video to Cloudinary
     * @param {string} localFilePath - Path to temp file created by multer
     */
    async uploadVideo(localFilePath) {
        try {
            const result = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'video',
                folder: 'careermaster/videos',
                eager: [
                    // Auto generate a thumbnail
                    { width: 800, crop: "scale", format: "jpg", start_offset: "0" }
                ],
            });

            // Clean up local temp file
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }

            return {
                cloudinary_id: result.public_id,
                cloudinary_url: result.secure_url,
                thumbnail_url: result.eager[0].secure_url,
                duration: Math.round(result.duration),
            };
        } catch (error) {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
    }

    /**
     * Delete video from Cloudinary
     */
    async deleteVideo(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        } catch (error) {
            console.error(`Failed to delete video from cloudinary: ${error.message}`);
        }
    }
}

module.exports = new CloudinaryService();
