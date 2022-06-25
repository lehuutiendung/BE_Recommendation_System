const cloudinary = require("cloudinary");
require('dotenv').config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

module.exports = {
    cloudinary,
    uploads: (file, folder) => {
        return new Promise(resolve => {
            cloudinary.uploader.upload(file, (result) => {
                resolve({
                    imageURL: result.secure_url,
                    cloudinaryID: result.public_id,
                    resourceType: result.resource_type
                })
            }, {
                resource_type: "auto",
                folder: folder
            })
        })
    }
}
