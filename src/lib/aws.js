// @/lib/aws.js
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const uploadToS3 = async ({ file, fullPath, fileType = 'image/jpeg', AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET }) => {

  const s3 = new S3Client({
      credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: AWS_REGION,
  });

  try {
      const upload = new Upload({
          client: s3,
          params: {
              Bucket: AWS_BUCKET,
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

