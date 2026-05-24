import { v2 as cloudinary } from "cloudinary";

const artworkFolder = "pictoria/artworks";

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function getArtworkCloudinaryFolder() {
  return artworkFolder;
}

export function getCloudinaryArtworkThumbnailUrl(publicId: string) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        crop: "limit",
        fetch_format: "auto",
        quality: "auto",
        width: 960,
      },
    ],
  });
}

export function getCloudinaryArtworkBlurUrl(publicId: string) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        crop: "limit",
        effect: "blur:1000",
        fetch_format: "auto",
        quality: "auto:low",
        width: 24,
      },
    ],
  });
}
