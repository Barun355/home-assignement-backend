-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "slno" BIGINT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "vendorRate" INTEGER NOT NULL,
    "vendorName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);
