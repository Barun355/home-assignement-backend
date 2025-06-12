import { UploadApiResponse } from "cloudinary";
export declare const uploadImage: (image: Express.Multer.File) => Promise<{
    data: null | UploadApiResponse;
    message: string;
    error: string | null;
}>;
