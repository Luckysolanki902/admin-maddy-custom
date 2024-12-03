// app/api/admin/aws/upload-to-s3/route.js
import { uploadToS3 } from '@/lib/aws';
import { NextResponse } from 'next/server';



export async function POST(request) {
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const AWS_REGION = process.env.AWS_REGION;
    const AWS_BUCKET = process.env.AWS_BUCKET;

    try {
        const { file, fullPath, fileType } = await request.json();

        if (!file || !fullPath || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_BUCKET) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        const buffer = Buffer.from(file, 'base64');

        const relativePath = await uploadToS3({
            file: buffer,
            fullPath,
            fileType,
            AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY,
            AWS_REGION,
            AWS_BUCKET,
        });

        return NextResponse.json({ path: relativePath }, { status: 200 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
    }
}

