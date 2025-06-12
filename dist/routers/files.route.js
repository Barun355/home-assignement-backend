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
const xlsx_1 = require("xlsx");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/import", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const { sheetName } = req.body;
    if (!file) {
        res
            .json({
            data: null,
            message: "File is missing",
            error: "This route expect an excel file, which is not present.",
        })
            .status(400);
        return;
    }
    if (!sheetName) {
        res
            .json({
            data: null,
            message: "Sheet not Selected",
            error: "Please select the sheet name.",
        })
            .status(400);
        return;
    }
    var sheetDataInJson = [];
    try {
        // console.log("import route: ", file, sheetName);
        const parsedFile = (0, xlsx_1.readFile)(file === null || file === void 0 ? void 0 : file.path);
        const sheet = parsedFile.Sheets[sheetName];
        const data = xlsx_1.utils.sheet_to_json(sheet);
        // console.log("Excel File Parse: ", data);
        data.map((field, idx) => {
            var vendorRate;
            if (field["vendor rate"] && typeof field["vendor rate"] === "string") {
                vendorRate = Number(field["vendor rate"].replace(",", "").replace("₹", ""));
            }
            sheetDataInJson.push({
                slno: idx + 1,
                image: field.Image ? field.Image : "",
                itemDescription: field["ITEM DESCRIPTION"]
                    ? field["ITEM DESCRIPTION"]
                    : "",
                location: field.Location ? field.Location : "",
                remarks: field.REMARKS ? field.REMARKS : "",
                vendorName: field["Vendor name"] ? field["Vendor name"] : "",
                vendorRate: vendorRate ? vendorRate : 0,
            });
        });
    }
    catch (error) {
        // console.log(`Parse File error: `, error);
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
    try {
        const products = yield db_1.prisma.products.createManyAndReturn({
            skipDuplicates: true,
            data: sheetDataInJson,
        });
        res
            .json({
            data: products,
            message: "File imported sucessfully",
            error: null,
        })
            .status(200);
        return;
    }
    catch (error) {
        console.log("DB insert error: ", error);
        res
            .json({
            data: null,
            error: typeof error.message === "string"
                ? error === null || error === void 0 ? void 0 : error.message
                : "Server side error",
            message: "Server side error",
        })
            .status(500);
        return;
    }
}));
exports.default = router;
