export type ProductsCreateManyInput = {
    id?: string;
    slno: number;
    itemDescription: string;
    remarks: string;
    vendorRate: number;
    vendorName: string;
    location: string;
    image: string;
};
export interface SheetColumnsType {
    "SL. NO.": number;
    "ITEM DESCRIPTION": string;
    REMARKS: string;
    "vendor rate": number;
    "Vendor name": string;
    Location: string;
    Image: string;
}
