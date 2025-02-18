import { ClientSession, ObjectId, Types } from "mongoose";
import idConverter from "./idConvirter";
import VariantModel from "../modules/variant/variant.model";
import { CartModel } from "../modules/users/users.model";
import { calculateCartTotalsWithSession } from "./calculatecartTotal";
import mongoose from "mongoose";
import verientCounter from "./veriantCounter";


const updateVariantQuantities = async (
    cart: any[],
    session: ClientSession,
    takeAllAvailable: boolean,
    userId: Types.ObjectId
  ) => {
    try {
      let variantUpdates: any[] = [];
      let cartUpdates: any[] = [];
  
      for (const item of cart) {
        const variantId = idConverter(item.veriantId);
        if (!variantId) continue;
  
        const variant = await VariantModel.findById({ _id: variantId }).session(session);
        if (!variant) {
          console.error(`Variant ${item.veriantId} not found`);
          continue;
        }
  
        const availableQuantity = variant.quantity;
        const requestedQuantity = item.quantity;
        let newQuantity = availableQuantity - requestedQuantity;
  
        if (newQuantity < 0 && !takeAllAvailable) {
          variantUpdates.push({
            ...variant.toObject(),
            availableQuantity,
            requestedQuantity,
            status: "insufficient",
          });
          continue;
        }
  
        if (newQuantity < 0) {
          newQuantity = 0;
        }
  
        // Update variant quantity in the database
        await VariantModel.updateOne(
          { _id: variant._id },
          { $set: { quantity: newQuantity } },
          { session }
        );

        if (variant.productId instanceof mongoose.Types.ObjectId) {
            await verientCounter(variant.productId);
          } else {
            // @ts-ignore
            await verientCounter(variant.productId._id); 
          }
  
        variantUpdates.push({
          ...variant.toObject(),
          availableQuantity,
          requestedQuantity,
          updatedQuantity: newQuantity,
          status: "updated",
        });
  
        if (takeAllAvailable && requestedQuantity > availableQuantity) {
          cartUpdates.push({
            veriantId: item.veriantId,
            newQuantity: availableQuantity,
          });
        }
      }
  
      // If takeAllAvailable is true, update the cart quantities to match available stock
      if (takeAllAvailable && cartUpdates.length > 0) {
        for (const update of cartUpdates) {
          await CartModel.updateOne(
            { userId, "cart.veriantId": update.veriantId },
            { $set: { "cart.$.quantity": update.newQuantity } },
            { session }
          );
        }
       await  calculateCartTotalsWithSession(userId,session)
      }
  
      return variantUpdates;
    } catch (error: any) {
      console.error("Error updating variant quantities:", error);
      return { error: error.message, variantUpdates: [] };
    }
  };
  
  

export default updateVariantQuantities;