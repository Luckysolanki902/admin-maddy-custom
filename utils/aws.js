import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
dotenv.config();

const AWS_Access_Key = process.env.AWS_ACCESS_KEY_ID;
const AWS_Secret_Key = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_Region = process.env.AWS_REGION;
const AWS_S3_Bucket = process.env.AWS_BUCKET;

const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_Access_Key,
    secretAccessKey: AWS_Secret_Key,
  },
  region: AWS_S3_Region,
});
export const uploadToS3 = async (file, name, bikeCode, fileType) => {
  try {
    if (!AWS_S3_Bucket) {
      throw new Error('AWS_S3_Bucket is not defined');
    }
    const fileName = `${bikeCode}/${name}.jpg`;
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: AWS_S3_Bucket,
        Key: fileName,
        Body: file,
        ContentType: fileType,
      },
    });

    await upload.done();
    return `https://dujzfhd00u2ou.cloudfront.net/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload to S3');
  }
};
export const multiUploadToS3 = async (files, bikeCode) => {
  try {
    await Promise.all(files.map(async (file, index) => {
      const name = `${bikeCode}${index + 1}`;
      const fileName = `${bikeCode}/${name}.jpg`;
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: AWS_S3_Bucket,
          Key: fileName,
          Body: file,
          ContentType: 'image/jpeg', // Adjust the content type based on your files
        },
      });

      await upload.done();
    }));

    return true; // Return a boolean indicating success
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return false; // Return a boolean indicating failure
  }
};
