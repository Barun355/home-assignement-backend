"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const uploadImage = (image) => __awaiter(void 0, void 0, void 0, function* () {
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
    cloudinary_1.v2.config({
        api_key,
        api_secret,
        cloud_name,
    });
    try {
        console.log("uploadImage 2: ");
        const uploadResult = yield cloudinary_1.v2.uploader.upload(image.path, {
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
    }
    catch (error) {
        console.log("Cloudinary Server error: ", error);
        return {
            data: null,
            message: "Unable to upload image",
            error: typeof error.message === "string"
                ? error.message
                : "Cloudinary upload error",
        };
    }
});
exports.uploadImage = uploadImage;
