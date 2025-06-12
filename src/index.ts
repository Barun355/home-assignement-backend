import express, { Express } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 8000;

const app: Express = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname + "/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log("filename storage: ", file);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
});

app.use(cors());
app.use(express.json());

app.get("/api/v1/test", (_, res) => {
  res.json({ data: null, message: "Server running succefully" });
});

import fileRoute from "./routers/files.route";
import productRoute from "./routers/producs.route";

app.use("/api/v1/files", upload.single("import"), fileRoute);
app.use(
  "/api/v1/product",
  upload.fields([
    { name: "updatedProductImage", maxCount: 1 },
    { name: "productImage", maxCount: 1 },
  ]),
  productRoute
);

app.listen(PORT, () => {
  console.log(`Server started in http://localhost:${PORT}`);
});
