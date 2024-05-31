import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

const deleteImageByPublicId = (publicId) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

const uploadOnCloudinary = async (localFilePath,folder) => {
    try{
        if(!localFilePath) return null
        //upload the file on cloudinary
        let response;
        if(folder){
            response = await cloudinary.uploader.upload(localFilePath , {
                folder: folder,
                resource_type: "auto"
            });
        }
        else{
            response = await cloudinary.uploader.upload(localFilePath , {
                resource_type: "auto"
            });
        }
        fs.unlinkSync(localFilePath);
         return response;
    } catch (error) {
        console.log("Error while uploading",error)
        return null;
    }
}

export {uploadOnCloudinary,deleteImageByPublicId}