import { startSession } from "mongoose";
import { ObjApprovalStatus, userRole } from "../../constent";
import idConverter from "../../util/idConvirter";
import { ProductListModel } from "../productList/productlist.model";
import UserModel, {
  SellsListModel,
  ShippingLineModel,
  ShopModel,
} from "../users/users.model";

const findAllShops = async () => {
  const result = await ShopModel.find({ approvalStatus: "approved" }).populate(
    "productListId"
  );
  return result;
};

const getAllShopRequests = async (approvalStatus: string) => {
  const result = await ShopModel.find({ approvalStatus });

  if (!result.length) {
    throw new Error("No shop requests found");
  }

  return result.map((shop) => ({
    shopId: shop._id,
    ...shop.toObject(), // Convert Mongoose document to plain object
  }));
};

const approveOrDenyShopReq = async (shopId: string, approvalStatus: string) => {
  const session = await startSession();
  session.startTransaction();

  try {
    // Convert shopId to ObjectId
    const convertedShopId = idConverter(shopId);

    // Find the shop by the converted ObjectId
    const findAShop = await ShopModel.findById(convertedShopId).session(
      session
    );
    if (!findAShop) {
      throw new Error("Shop not found");
    }

    // Update the approval status in the database
    await ShopModel.findByIdAndUpdate(
      convertedShopId,
      { approvalStatus },
      { session }
    );

    if (approvalStatus === ObjApprovalStatus.denied) {
      await session.commitTransaction();
      session.endSession();
      return { message: "Shop request has been denied" };
    } else if (approvalStatus === ObjApprovalStatus.approved) {
      // Create the product list, ensuring that shopId is passed correctly
      const productList = await ProductListModel.create(
        [
          {
            userId: findAShop.userId,
            shopId: convertedShopId, // Ensure the correct shopId is passed here
          },
        ],
        { session }
      );

      // Create the seller's list
      const selsList = await SellsListModel.create(
        [
          {
            userId: findAShop.userId,
            shopId: convertedShopId, // Ensure the correct shopId is passed here
          },
        ],
        { session }
      );

      const shippingLine = await ShippingLineModel.create(
        [
          {
            userId: findAShop.userId,
            shopId: convertedShopId, // Ensure the correct shopId is passed here
          },
        ],
        { session }
      );

      const updateShop = await ShopModel.findByIdAndUpdate(
        { _id: convertedShopId },
        {
          productListId: productList[0]._id,
          sellsListId: selsList[0]._id,
          shippingLineId: shippingLine[0]._id,
        },
        { new: true, session }
      );

      // Update the user with the new related IDs
      const updateUser = await UserModel.findByIdAndUpdate(
        { _id: findAShop.userId },
        {
          shopId: convertedShopId,
          productListId: productList[0]._id,
          sellsListId: selsList[0]._id,
          shippingLineId: shippingLine[0]._id,
          role: userRole.seller,
        },
        { new: true, session }
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return {
        message: "Shop approved, product & sells list created",
        user: updateUser,
      };
    }

    await session.commitTransaction();
    session.endSession();
    return { message: "Approval status updated successfully" };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error processing shop request: ${error.message}`);
  }
};

const adminServices = {
  findAllShops,
  getAllShopRequests,
  approveOrDenyShopReq,
};

export default adminServices;
