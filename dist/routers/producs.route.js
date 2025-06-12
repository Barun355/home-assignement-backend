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
const express_1 = require("express");
const db_1 = require("../db");
const images_1 = require("../service/images");
const router = (0, express_1.Router)();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    var pageIndex = 1;
    var pageSize = 20;
    var skip = (pageIndex - 1) * pageSize;
    var nextPage = false;
    var totalPage = 0;
    if (query.pageIndex) {
        pageIndex = Number(query.pageIndex);
    }
    if (query.pageSize) {
        pageSize = Number(query.pageSize);
    }
    skip = (pageIndex - 1) * pageSize;
    try {
        const totalProducts = yield db_1.prisma.products.count();
        totalPage = parseInt(`${totalProducts / pageSize}`) + 1;
        nextPage = pageIndex > totalPage ? false : true;
        console.log(totalProducts, totalPage, nextPage);
        if (!nextPage) {
            res
                .json({
                data: null,
                message: "Page end.",
                error: "page end.",
            })
                .status(200);
            return;
        }
        const products = yield db_1.prisma.products.findMany({
            skip,
            take: pageSize,
        });
        res.json({
            data: {
                products,
                totalProducts,
                nextPage,
                totalPage,
            },
            error: null,
            message: "Products fetched successfully.",
        });
        return;
    }
    catch (error) {
        res
            .json({
            data: null,
            message: "Server side error",
            error: typeof error.message === "string"
                ? error === null || error === void 0 ? void 0 : error.message
                : "Server side error",
        })
            .status(500);
        return;
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { itemDescription, location, remarks, slno, vendorName, vendorRate } = req.body;
    const files = req.files;
    const productImage = (_a = files["productImage"]) === null || _a === void 0 ? void 0 : _a[0];
    console.log(files, productImage);
    if (!itemDescription &&
        !location &&
        !remarks &&
        !slno &&
        !vendorName &&
        !vendorRate) {
        res.json({
            data: null,
            message: "All the fields are required.",
            error: "All the fields are required id, itemDescription, location, remarks, slno, vendorName, vendorRate.",
        });
        return;
    }
    if (!productImage) {
        res
            .json({
            data: null,
            message: "Product image is required",
            error: "Product image is required.",
        })
            .status(404);
        return;
    }
    try {
        const existingProduct = yield db_1.prisma.products.findFirst({
            where: {
                slno: Number(slno),
            },
        });
        if (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.id) {
            res
                .json({
                data: null,
                message: "Product already exists",
                error: "Proudct already exists",
            })
                .status(404);
            return;
        }
        console.log("object1");
        const upload = yield (0, images_1.uploadImage)(productImage);
        console.log("object2");
        if (upload.error) {
            res.json(upload).status(500);
            return;
        }
        console.log(upload);
        const newProduct = yield db_1.prisma.products.create({
            data: {
                image: (_b = upload.data) === null || _b === void 0 ? void 0 : _b.url,
                itemDescription,
                location,
                remarks,
                slno: Number(slno),
                vendorName,
                vendorRate: Number(vendorRate),
            },
        });
        if (newProduct.id) {
            res.json({
                data: newProduct,
                message: "Product created succesfully",
                error: null,
            });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res
            .json({
            data: null,
            message: "Server side error",
            error: typeof (error === null || error === void 0 ? void 0 : error.message) === "string"
                ? error === null || error === void 0 ? void 0 : error.message
                : "Server side error",
        })
            .status(500);
    }
}));
router.put("/updateProductImage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const files = req.files;
    const image = (_a = files["updatedProductImage"]) === null || _a === void 0 ? void 0 : _a[0];
    const { productId } = req.body;
    console.log(req.body);
    if (!image) {
        res
            .json({
            data: null,
            message: "Please send image",
            error: "Please send image",
        })
            .status(403);
        return;
    }
    try {
        console.log("object1");
        const existingProduct = yield db_1.prisma.products.findFirst({
            where: {
                id: productId,
            },
        });
        console.log("object2");
        console.log(existingProduct);
        if (!(existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.id)) {
            res
                .json({
                data: null,
                error: "Product not found",
                message: "Product not found",
            })
                .status(404);
            return;
        }
        console.log("object3");
        const upload = yield (0, images_1.uploadImage)(image);
        console.log("object4");
        if (upload.error) {
            res.json(upload).status(500);
            return;
        }
        console.log(upload);
        const updatedProduct = yield db_1.prisma.products.update({
            where: {
                id: productId,
            },
            data: {
                image: (_b = upload.data) === null || _b === void 0 ? void 0 : _b.url,
            },
        });
        console.log(updatedProduct);
        res
            .json({
            data: {
                id: updatedProduct.id,
                image: updatedProduct.image,
            },
            message: "Updated image",
            error: null,
        })
            .status(400);
        return;
    }
    catch (error) {
        res
            .json({
            data: null,
            message: "Server side error",
            error: typeof error.message == "string"
                ? error.message
                : "Server side error",
        })
            .status(500);
        return;
    }
}));
router.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, itemDescription, location, remarks, slno, vendorName, vendorRate, } = req.body.product;
    if (!id &&
        !itemDescription &&
        !location &&
        !remarks &&
        !slno &&
        !vendorName &&
        !vendorRate) {
        res.json({
            data: null,
            message: "All the fields are required.",
            error: "All the fields are required id, itemDescription, location, remarks, slno, vendorName, vendorRate.",
        });
        return;
    }
    try {
        const existingProduct = yield db_1.prisma.products.findFirst({
            where: {
                id,
            },
        });
        if (!(existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.id)) {
            res.json({
                data: null,
                message: "Product not exists",
                error: "Proudct doesn't exists",
            });
            return;
        }
        console.log(req.body.product);
        const updatedProduct = yield db_1.prisma.products.update({
            where: {
                id,
            },
            data: {
                itemDescription,
                location,
                remarks,
                slno: Number(slno),
                vendorName,
                vendorRate: Number(vendorRate),
            },
        });
        if (updatedProduct.id) {
            res.json({
                data: updatedProduct,
                message: "Product updated succesfully",
                error: null,
            });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.json({
            data: null,
            message: "Server side error",
            error: typeof (error === null || error === void 0 ? void 0 : error.message) === "string"
                ? error === null || error === void 0 ? void 0 : error.message
                : "Server side error",
        });
    }
}));
router.delete("/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    if (!productId) {
        res
            .json({
            data: null,
            message: "Product Id missing",
            error: "Product Id not provided.",
        })
            .status(404);
        return;
    }
    try {
        const product = yield db_1.prisma.products.findFirst({
            where: {
                id: productId,
            },
            select: {
                id: true,
            },
        });
        if (!product) {
            res
                .json({
                data: null,
                message: "Product not found",
                error: "Product not found in db",
            })
                .status(404);
            return;
        }
    }
    catch (error) {
        res
            .json({
            data: null,
            message: "Server side error",
            error: typeof (error === null || error === void 0 ? void 0 : error.message) === "string"
                ? error === null || error === void 0 ? void 0 : error.message
                : "Server side error",
        })
            .status(500);
        return;
    }
    try {
        yield db_1.prisma.products.delete({
            where: {
                id: productId,
            },
        });
        res
            .json({
            data: true,
            message: "Data deleted Succesfully",
            error: null,
        })
            .status(200);
        return;
    }
    catch (error) {
        res.json({
            data: null,
            message: "Server side error",
            error: typeof (error === null || error === void 0 ? void 0 : error.message) === "string"
                ? error === null || error === void 0 ? void 0 : error.message
                : "Server side error",
        });
    }
}));
exports.default = router;
