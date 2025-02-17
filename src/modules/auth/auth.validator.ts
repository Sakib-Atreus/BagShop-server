import z from "zod";

export const logInValidator = z.object({
  body: z.object({
    email: z.string().email({ message: "email is required" }),
    password: z.string({ message: "password is required" }),
  }),
});
