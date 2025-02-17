import catchAsync from "../../util/catchAsync";
import idConverter from "../../util/idConvirter";
import userServices from "./users.service";

const createUser = catchAsync(async (req, res) => {
  const result = await userServices.createUser(req.body);

  res.status(200).json({
    message: "User Created Successfully with all collection",
    user_Id: result.user?._id,
  });
});

const createShop = catchAsync(async (req, res) => {
  const payload = req.body;
  const userId = idConverter(req.user!.id);
  console.log(req.user);
  if (!payload || !userId) {
    throw new Error("Payload or userId is missing");
  }

  const result = await userServices.createAshop(userId, payload);

  res.status(200).json({
    message: "Request to create a shop is pending",
    result: result,
  });
});

const makeAnorder = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const orderListId = req.user!.orderListId;
  const payload = req.body;

  if (!userId || !orderListId) {
    throw new Error("!userId || !orderListId || !cartId");
  }

  const result = await userServices.makeAnorder(userId, orderListId, payload);
  if (!result) {
    throw new Error("something went wrong");
  }

  if (result.status === "succeeded") {
    res.json({
      success: true,
      clientSecret: result.client_secret,
      redirectUrl: "/success",
    });
  } else if (result.status === "canceled") {
    res.status(400).json({
      success: false,
      message: "payment failed",
      redirectUrl: "/error",
    });
  } else if (result.message === "ok") {
    res.status(200).json({
      status: "success",
      message: result,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Unexpected payment status",
    });
  }
});

const userController = {
  createUser,
  createShop,
  makeAnorder,
};
export default userController;
