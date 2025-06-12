import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export const uploadImage = async (
  image: Express.Multer.File
): Promise<{
  data: null | UploadApiResponse;
  message: string;
  error: string | null;
}> => {
  if (!image) {
    return {
      data: null,
      error: "Image argument is required of File type.",
      message: "Image is required.",
    };
  }

  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;

  console.log("uploadImage 1: ", { api_key, api_secret, cloud_name, image });
  if (!api_key && !api_secret && !cloud_name) {
    console.log("api_key, api_secret, cloud_name required");
    return {
      data: null,
      message: "api_key, api_secret, cloud_name required",
      error: "api_key, api_secret, cloud_name required",
    };
  }

  cloudinary.config({
    api_key,
    api_secret,
    cloud_name,
  });

  try {
    console.log("uploadImage 2: ");

    const uploadResult = await cloudinary.uploader.upload(image.path, {
      public_id: `home-assignment/${image.filename}`,
      type: 'upload',
      resource_type: 'image'
    });

    console.log("uploadImage 3:", uploadResult);
    return {
      data: uploadResult,
      error: null,
      message: "Upload image to cloudinary success.",
    };
  } catch (error: any) {
    console.log("Cloudinary Server error: ", error);
    return {
      data: null,
      message: "Unable to upload image",
      error:
        typeof error.message === "string"
          ? error.message
          : "Cloudinary upload error",
    };
  }
};
