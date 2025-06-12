import { Router } from "express";
import { prisma } from "../db";
import { uploadImage } from "../service/images";

const router = Router();

router.get("/", async (req, res) => {
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
    const totalProducts = await prisma.products.count();

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
    const products = await prisma.products.findMany({
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
  } catch (error: any) {
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
});

router.post("/", async (req, res) => {
  const { itemDescription, location, remarks, slno, vendorName, vendorRate } =
    req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const productImage = files["productImage"]?.[0];

  console.log(files, productImage)

  if (
    !itemDescription &&
    !location &&
    !remarks &&
    !slno &&
    !vendorName &&
    !vendorRate
  ) {
    res.json({
      data: null,
      message: "All the fields are required.",
      error:
        "All the fields are required id, itemDescription, location, remarks, slno, vendorName, vendorRate.",
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
    const existingProduct = await prisma.products.findFirst({
      where: {
        slno: Number(slno),
      },
    });

    if (existingProduct?.id) {
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
    const upload = await uploadImage(productImage);
    console.log("object2");

    if (upload.error) {
      res.json(upload).status(500);
      return;
    }

    console.log(upload);

    const newProduct = await prisma.products.create({
      data: {
        image: upload.data?.url!,
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
  } catch (error: any) {
    console.log(error);
    res
      .json({
        data: null,
        message: "Server side error",
        error:
          typeof error?.message === "string"
            ? error?.message
            : "Server side error",
      })
      .status(500);
  }
});

router.put("/updateProductImage", async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const image = files["updatedProductImage"]?.[0];

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
    const existingProduct = await prisma.products.findFirst({
      where: {
        id: productId,
      },
    });
    console.log("object2");
    console.log(existingProduct);
    if (!existingProduct?.id) {
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
    const upload = await uploadImage(image);
    console.log("object4");

    if (upload.error) {
      res.json(upload).status(500);
      return;
    }

    console.log(upload);

    const updatedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        image: upload.data?.url,
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
  } catch (error: any) {
    res
      .json({
        data: null,
        message: "Server side error",
        error:
          typeof error.message == "string"
            ? error.message
            : "Server side error",
      })
      .status(500);
    return;
  }
});

router.put("/", async (req, res) => {
  const {
    id,
    itemDescription,
    location,
    remarks,
    slno,
    vendorName,
    vendorRate,
  } = req.body.product;

  if (
    !id &&
    !itemDescription &&
    !location &&
    !remarks &&
    !slno &&
    !vendorName &&
    !vendorRate
  ) {
    res.json({
      data: null,
      message: "All the fields are required.",
      error:
        "All the fields are required id, itemDescription, location, remarks, slno, vendorName, vendorRate.",
    });
    return;
  }

  try {
    const existingProduct = await prisma.products.findFirst({
      where: {
        id,
      },
    });

    if (!existingProduct?.id) {
      res.json({
        data: null,
        message: "Product not exists",
        error: "Proudct doesn't exists",
      });
      return;
    }

    console.log(req.body.product);

    const updatedProduct = await prisma.products.update({
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
  } catch (error: any) {
    console.log(error);
    res.json({
      data: null,
      message: "Server side error",
      error:
        typeof error?.message === "string"
          ? error?.message
          : "Server side error",
    });
  }
});

router.delete("/:productId", async (req, res) => {
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
    const product = await prisma.products.findFirst({
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
  } catch (error: any) {
    res
      .json({
        data: null,
        message: "Server side error",
        error:
          typeof error?.message === "string"
            ? error?.message
            : "Server side error",
      })
      .status(500);
    return;
  }

  try {
    await prisma.products.delete({
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
  } catch (error: any) {
    res.json({
      data: null,
      message: "Server side error",
      error:
        typeof error?.message === "string"
          ? error?.message
          : "Server side error",
    });
  }
});

export default router;
