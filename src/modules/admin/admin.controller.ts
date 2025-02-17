import catchAsync from "../../util/catchAsync";
import adminServices from "./admin.service";

const getAllShops = catchAsync(async (req, res) => {
  const result = await adminServices.findAllShops();
  res.status(200).json({
    message: "all shop are found",
    data: result,
  });
});

const getAllShopRequests = catchAsync(async (req, res) => {
  const approvalStatus = req.query.approvalStatus as string;
  if (!approvalStatus) {
    throw Error("no approval state was passed");
  }
  const result = await adminServices.getAllShopRequests(approvalStatus);
  res.status(200).json({
    message: `all ${approvalStatus} shops are found`,
    data: result,
  });
});

const approveOrDenyShopReq = catchAsync(async (req, res) => {
  const shopId = req.query.shopId as string;
  const approvalStatus = req.query.approvalStatus as string;

  if (!shopId || !approvalStatus) {
    throw Error("shop id or approval status went missing");
  }

  const result = await adminServices.approveOrDenyShopReq(
    shopId,
    approvalStatus
  );
  res.status(200).json({
    message: `shop is ${approvalStatus}`,
    data: result,
  });
});

const adminController = {
  getAllShops,
  getAllShopRequests,
  approveOrDenyShopReq,
};

export default adminController;
