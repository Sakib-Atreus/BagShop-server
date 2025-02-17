import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import httpStatus from "http-status";
import { variantServices } from "./variant.service";
import { uploadMultipleImages } from "../../util/uploadImgToCloudynary";

const createVariant = catchAsync(async (req, res) => {
  const variantData = JSON.parse(req.body.data);
  const productId = req.query.productId as string;

  // console.log(productId,req.body.data)

  const userId = req.user!.id;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No images were uploaded.",
    });
  }

  let imageArray: string[] = [];

  // Collect the file paths for uploading
  const filePaths = files.map((file) => file.path);

  await uploadMultipleImages(filePaths)
    .then((imageUrls) => {
      imageArray = imageUrls;
    })
    .catch((error) => {
      console.error("Error uploading images:", error);
      return res.status(500).json({
        success: false,
        message: "Error uploading images.",
      });
    });

  variantData.images = imageArray;

  if (!variantData || !productId || !userId) {
    throw Error("!variantData|| !productId|| !userId is midssing");
  }

  console.log("i am here", variantData);

  const result = await variantServices.createVariantIntoDB(
    variantData,
    productId,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "product created successfully",
    data: result,
  });
});
export const variantControllers = {
  createVariant,
};
