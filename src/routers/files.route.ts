import { Router } from "express";
import { readFile, utils, WorkBook } from "xlsx";
import { prisma } from "../db";
import { ProductsCreateManyInput, SheetColumnsType } from "../types";

const router: Router = Router();

router.post("/import", async (req, res) => {
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
  var sheetDataInJson: ProductsCreateManyInput[] = [];

  try {
    // console.log("import route: ", file, sheetName);

    const parsedFile: WorkBook = readFile(file?.path);
    const sheet = parsedFile.Sheets[sheetName];
    const data: SheetColumnsType[] = utils.sheet_to_json(sheet);

    // console.log("Excel File Parse: ", data);

    data.map((field, idx) => {
      var vendorRate;

      if (field["vendor rate"] && typeof field["vendor rate"] === "string") {
        vendorRate = Number(
          (field["vendor rate"] as string).replace(",", "").replace("₹", "")
        );
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
  } catch (error: any) {
    // console.log(`Parse File error: `, error);

    res
      .json({
        data: null,
        message: "Server side error",
        error:
          typeof error.message === "string"
            ? error?.message
            : "Server side error",
      })
      .status(500);
    return;
  }

  try {
    const products = await prisma.products.createManyAndReturn({
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
  } catch (error: any) {
    console.log("DB insert error: ", error);
    res
      .json({
        data: null,
        error:
          typeof error.message === "string"
            ? error?.message
            : "Server side error",
        message: "Server side error",
      })
      .status(500);
    return;
  }
});

export default router;