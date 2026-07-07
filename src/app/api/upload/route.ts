import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import ImageKit from "imagekit";

// Configure Cloudinary
// It will automatically use the CLOUDINARY_URL environment variable if present.
// Alternatively, we can explicitly configure it if needed.

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file as ArrayBuffer, then convert to Buffer (Node.js) or Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try Cloudinary First
    try {
      const cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "fj-store/products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      const data = cloudinaryResult as any;

      return NextResponse.json({
        url: data.secure_url,
        provider: "cloudinary",
        public_id: data.public_id,
        file_size: data.bytes,
        mime_type: data.format ? `image/${data.format}` : file.type,
      });
    } catch (cloudinaryError) {
      console.warn("Cloudinary upload failed, falling back to ImageKit...", cloudinaryError);

      // 2. Fallback to ImageKit
      const imageKitResult = await imagekit.upload({
        file: buffer,
        fileName: file.name || "upload_image",
        folder: "/fj-store/products",
      });

      return NextResponse.json({
        url: imageKitResult.url,
        provider: "imagekit",
        public_id: imageKitResult.fileId,
        file_size: imageKitResult.size,
        mime_type: file.type, // ImageKit returns format in some cases, but file.type is safe
      });
    }
  } catch (error) {
    console.error("Upload error (both providers failed):", error);
    return NextResponse.json(
      { error: "Image upload failed on all providers." },
      { status: 500 }
    );
  }
}
