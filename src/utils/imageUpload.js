import AWS from 'aws-sdk';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

export const uploadImage = async (file) => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: config.aws.bucketName,
    Key: `images/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw new Error('Error uploading image: ' + error.message);
  }
};

export const deleteImage = async (imageUrl) => {
  const key = imageUrl.split('/').pop();
  
  const params = {
    Bucket: config.aws.bucketName,
    Key: `images/${key}`
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error('Error deleting image: ' + error.message);
  }
}; 