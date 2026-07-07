import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import ImageKit from "imagekit";

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
}

function hasImageKitConfig() {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT
  );
}

function buildDataUrl(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function uploadToCloudinary(buffer: Buffer, file: File) {
  if (!hasCloudinaryConfig()) {
    throw new Error("Cloudinary is not configured");
  }

  // Configure Cloudinary explicitly
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL,
    });
  }

  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "fj-store/products", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

  return {
    url: result.secure_url,
    provider: "cloudinary",
    public_id: result.public_id,
    file_size: result.bytes || file.size,
    mime_type: result.format ? `image/${result.format}` : file.type,
  };
}

async function uploadToImageKit(buffer: Buffer, file: File) {
  if (!hasImageKitConfig()) {
    throw new Error("ImageKit is not configured");
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
  });

  const imageKitResult = await imagekit.upload({
    file: buffer,
    fileName: file.name || "upload_image",
    folder: "/fj-store/products",
  });

  return {
    url: imageKitResult.url,
    provider: "imagekit",
    public_id: imageKitResult.fileId,
    file_size: imageKitResult.size || file.size,
    mime_type: file.type,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      if (hasCloudinaryConfig()) {
        return NextResponse.json(await uploadToCloudinary(buffer, file));
      }

      if (hasImageKitConfig()) {
        return NextResponse.json(await uploadToImageKit(buffer, file));
      }

      throw new Error("No external image provider configured");
    } catch (providerError) {
      console.warn("Primary image provider failed, using local data URL fallback:", providerError);

      return NextResponse.json({
        url: buildDataUrl(buffer, file.type || "image/png"),
        provider: "data-url",
        public_id: null,
        file_size: file.size,
        mime_type: file.type || "image/png",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Image upload failed. Please try another image or contact support." },
      { status: 500 }
    );
  }
}
