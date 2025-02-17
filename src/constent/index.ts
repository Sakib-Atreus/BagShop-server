export type TUserRole = "admin" | "customer" | "seller";
export type TPaymentMathod = "SSL" | "On_Arrival";

export const userRole = {
  admin: "admin",
  customer: "customer",
  seller: "seller",
} as const;

export const ObjApprovalStatus = {
  approved: "approved",
  pending: "pending",
  denied: "denied",
} as const;

export const paymentMathod = {
  SSL: "SSL",
  On_Arrival: "On_Arrival",
} as const;

export type TErrorSource = {
  path: string | number;
  message: string;
}[];
export const excludedFields = [
  "searchTerm",
  "sort",
  "limit",
  "page",
  "fields",
  "price",
  "popularItem",
  "inStock",
];
export const productSearchAbleField = [
  "bagType",
  "colorHexCode",
  "designer",
  "totalQuantity",
  "colorName",
];
