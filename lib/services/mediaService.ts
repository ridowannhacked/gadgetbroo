import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

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
   * Builds a unique, flat object key — no folder nesting — so the public URL is
   * always `${GARAGE_PUBLIC_URL}/<key>` e.g. https://octetit-uploads.cdn.octetit.com/<image_name>
   * @param fileName - Original name of the file (e.g. image.png)
   */
  buildFileKey(fileName: string): string {
    const uniqueId = crypto.randomUUID();
    const extension = fileName.split(".").pop() || "jpg";
    const cleanName = fileName.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 30);
    return `${uniqueId}-${cleanName}.${extension}`;
  },

  /**
   * Uploads a file to the S3 bucket directly from the server (no browser CORS involved —
   * this mirrors the proven pattern already running in the sibling octetit project, since
   * Garage's edge here does not reliably answer cross-origin preflight requests).
   * @param fileKey - Object key to store under (see buildFileKey)
   * @param body - Raw file bytes
   * @param contentType - MIME type (e.g. image/png)
   */
  async uploadFile(fileKey: string, body: Buffer, contentType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        Body: body,
        ContentType: contentType,
        ACL: "public-read",
      });

      await s3Client.send(command);

      return {
        fileKey,
        url: `${PUBLIC_URL}/${fileKey}`,
      };
    } catch (error) {
      console.error("MediaService: Error uploading file", error);
      throw new Error("Failed to upload file to storage");
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
