import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000";
const bucket = process.env.MINIO_BUCKET || "omega-images";

export const s3 = new S3Client({
  endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "omega_minio",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "omega_minio_secret",
  },
  forcePathStyle: true,
});

let bucketReady = false;

export async function ensureBucket() {
  if (bucketReady) return;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  }

  // Set public read policy so browser can load images
  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });

  try {
    await s3.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }));
  } catch {
    // Policy may already be set
  }

  bucketReady = true;
}

export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

export async function deleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export function getPublicUrl(key: string) {
  const publicUrl = process.env.MINIO_PUBLIC_URL || `${endpoint}/${bucket}`;
  return `${publicUrl}/${key}`;
}
