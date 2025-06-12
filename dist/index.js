"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname + "/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        console.log("filename storage: ", file);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/v1/test", (_, res) => {
    res.json({ data: null, message: "Server running succefully" });
});
const files_route_1 = __importDefault(require("./routers/files.route"));
const producs_route_1 = __importDefault(require("./routers/producs.route"));
app.use("/api/v1/files", upload.single("import"), files_route_1.default);
app.use("/api/v1/product", upload.fields([
    { name: "updatedProductImage", maxCount: 1 },
    { name: "productImage", maxCount: 1 },
]), producs_route_1.default);
app.listen(PORT, () => {
    console.log(`Server started in http://localhost:${PORT}`);
});
