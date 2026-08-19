import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate environment variables early
if (
  !process.env.GARAGE_ENDPOINT ||
  !process.env.GARAGE_REGION ||
  !process.env.GARAGE_ACCESS_KEY_ID ||
  !process.env.GARAGE_SECRET_ACCESS_KEY ||
  !process.env.GARAGE_BUCKET
) {
  console.warn("⚠️ Garage S3 environment variables are missing. Media uploads and deletions will fail.");
}

// Initialize the S3 Client
const s3Client = new S3Client({
  endpoint: process.env.GARAGE_ENDPOINT || "http://localhost:3900",
  region: process.env.GARAGE_REGION || "garage",
  credentials: {
    accessKeyId: process.env.GARAGE_ACCESS_KEY_ID || "missing_key",
    secretAccessKey: process.env.GARAGE_SECRET_ACCESS_KEY || "missing_secret",
  },
  forcePathStyle: true, // Required for S3 clones like MinIO / Garage
});

const BUCKET = process.env.GARAGE_BUCKET || "gadgetbroo";
const PUBLIC_URL = process.env.GARAGE_PUBLIC_URL || `${process.env.GARAGE_ENDPOINT}/${BUCKET}`;

export const MediaService = {
  /**
   * Generates a temporary Presigned URL for the client to upload files directly to the S3 bucket.
   * @param fileName - Original name of the file (e.g. image.png)
   * @param fileType - MIME type (e.g. image/png)
   * @param folder - Folder path (e.g. /prod/products)
   */
  async generatePresignedUrl(fileName: string, fileType: string, folder: string) {
    try {
      // Create a unique file key to prevent overwrites
      const uniqueId = crypto.randomUUID();
      const extension = fileName.split('.').pop() || 'jpg';
      // Clean filename for URL
      const cleanName = fileName.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30);

      // The exact S3 Object Key (Path in the bucket)
      // Remove leading slash if any
      const safeFolder = folder.startsWith('/') ? folder.substring(1) : folder;
      const fileKey = `${safeFolder}/${uniqueId}-${cleanName}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        ContentType: fileType,
        // ACL: "public-read", // Uncomment if bucket requires ACLs, Garage usually uses bucket policies instead
      });

      // Generate a presigned URL valid for 5 minutes
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      // Calculate final public URL
      const finalUrl = `${PUBLIC_URL}/${fileKey}`;

      return {
        presignedUrl,
        fileKey,
        url: finalUrl,
      };
    } catch (error) {
      console.error("MediaService: Error generating presigned URL", error);
      throw new Error("Failed to generate upload URL");
    }
  },

  /**
   * Deletes a file directly from the S3 bucket
   * @param fileKey - The exact S3 object key (e.g. prod/products/123-image.png)
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    if (!fileKey) return false;

    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
      });
      await s3Client.send(command);
      return true;
    } catch (error: any) {
      console.error("MediaService: Failed to delete file", error);
      return false; // Soft fail, allow the DB to clean up regardless
    }
  }
};
