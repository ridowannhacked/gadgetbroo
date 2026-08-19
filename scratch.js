import { S3Client, DeleteBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.GARAGE_ENDPOINT,
  region: process.env.GARAGE_REGION,
  credentials: {
    accessKeyId: process.env.GARAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.GARAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function run() {
  try {
    const command = new DeleteBucketCorsCommand({
      Bucket: process.env.GARAGE_BUCKET,
    });
    await s3Client.send(command);
    console.log("✅ Successfully deleted CORS config from Garage Bucket!");
  } catch (err) {
    console.error("❌ Failed to delete CORS:", err);
  }
}

run();
