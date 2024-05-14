import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { db } from "@/db";
import * as stream from "stream";
import { v4 as uuidv4 } from "uuid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// The ID of your GCS bucket
const BUCKET_NAME = "welltrack_report_bucket";

// API handler for uploading files
export const POST = async (req: NextRequest) => {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id) throw new Error("Unauthorized");

  try {
    const formData = await req.formData();

    const file = formData.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json(
        { error: "File blob is required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = new Storage({
      projectId: "welltrack-422720",
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // Get a reference to the bucket
    const myBucket = storage.bucket(BUCKET_NAME);

    // Create a reference to a file object
    const fileKey = generateStorageKey(file.name);
    const fileRef = myBucket.file(fileKey);

    // Create a pass-through stream and write the buffer
    const passthroughStream = new stream.PassThrough();
    passthroughStream.end(buffer);

    // Await the file upload to complete before proceeding
    const createdFile = await new Promise((resolve, reject) => {
      passthroughStream
        .pipe(fileRef.createWriteStream())
        .on(
          "finish",

          async () => {
            const createdFile = await db.file.create({
              data: {
                key: fileKey,
                name: file.name,
                userId: user.id,
                url: "to be delete",
                uploadStatus: "PROCESSING",
              },
            });

            try {
              await db.file.update({
                data: {
                  uploadStatus: "SUCCESS",
                },
                where: {
                  id: createdFile.id,
                },
              });
            } catch (err) {
              await db.file.update({
                data: {
                  uploadStatus: "FAILED",
                },
                where: {
                  id: createdFile.id,
                },
              });
            }

            resolve(createdFile);
          }
        )
        .on("error", reject);
    });

    return NextResponse.json(
      { success: true, file: createdFile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during file upload:", error);
    return NextResponse.json(
      { errro: "Error during file upload" },
      { status: 500 }
    );
  }
};

function generateStorageKey(originalFileName: string): string {
  const uniqueId = uuidv4(); // Generates a unique UUID
  const extension = originalFileName.split(".").pop(); // Gets the file extension
  return `${uniqueId}.${extension}`; // Combines UUID and file extension
}
