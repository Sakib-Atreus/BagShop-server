import idConverter from "./idConvirter";

export function generateOrderObjects(cart: any[], payload: any) {
  return cart.map((item) => ({
    customerId: idConverter(item.customerId),
    firstName: payload.firstName || null,
    lastName: payload.lastName || null,
    email: payload.email || null,
    phoneNo: payload.phoneNo || null,
    address: payload.address || null,
    townOrCity: payload.townOrCity || null,
    stateOrCountry: payload.stateOrCountry || null,
    postalCode: payload.postalCode || null,
    cardNumber: payload.cardNumber || null,
    expirationDate: payload.expirationDate
      ? new Date(payload.expirationDate)
      : null,
    securityCode: payload.securityCode || null,

    paymentMethod: payload.paymentMethod || null,
    variantId: idConverter(item.veriantId) || null,
    productId: idConverter(item.productId) || null,

    sellsListId: idConverter(item.sellsListId),
    shopId: idConverter(item.shopId),
    shippingLineId: idConverter(item.shippingLineId) || null,
    quantity: item.quantity || null,
    totalAmount: item.price * item.quantity || 0,

    isPayed: false,
    isCanceled: false,
    canceledBy: null,
  }));
}
