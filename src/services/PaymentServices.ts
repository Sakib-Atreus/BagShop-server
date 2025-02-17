import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export interface IPaymentServices {
  pay(
    totalAmount: Number,
    paymentMethodId: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    currency?: string
  ): Promise<Stripe.PaymentIntent>;
}
// Create a PaymentIntent

class PaymentServices implements IPaymentServices {
  async pay(
    totalAmount: number,
    paymentMethodId: string,
    fullname: string,
    email: string,
    phone: string,
    address: string,
    currency: string = "usd"
  ) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount, // Amount in cents ($50)
      currency: "usd",
      payment_method: paymentMethodId,
      payment_method_types: ["card"],
      confirm: true,
      receipt_email: email,
      metadata: { fullname, phone, address },
    });

    return paymentIntent;
  }
}

export const paymentService = new PaymentServices();

// Send success URL to frontend
