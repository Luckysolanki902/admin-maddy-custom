// @/lib/aws
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";

const AWS_Access_Key = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const AWS_Secret_Key = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const AWS_S3_Region = process.env.NEXT_PUBLIC_AWS_REGION;
const AWS_S3_Bucket = process.env.NEXT_PUBLIC_AWS_BUCKET;
 
const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_Access_Key,
    secretAccessKey: AWS_Secret_Key,
  },
  region: AWS_S3_Region,
});

export const uploadToS3 = async (file, fullPath, fileType = 'image/jpeg') => {
  try {
    if (!AWS_S3_Bucket) {
      throw new Error('AWS_S3_Bucket is not defined');
    }

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: AWS_S3_Bucket,
        Key: fullPath.startsWith('/') ? fullPath.slice(1) : fullPath,
        Body: file,
        ContentType: fileType,
      },
    });

    await upload.done();

    // Return the relative path after successful upload
    return fullPath;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload to S3');
  }
};


