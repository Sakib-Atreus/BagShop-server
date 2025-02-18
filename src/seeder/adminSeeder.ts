import { TUser } from "../modules/users/users.interface";
import UserModel from "../modules/users/users.model";
import userServices from "../modules/users/users.service";

export const adminSeeder = async () => {
    try {
        const isAdminExist = await UserModel.findOne({ role: "admin" });

        if (isAdminExist) {
            console.log("✅ Admin already exists. Skipping seeder.");
            return;
        }

        const admin: TUser = {
            name: "Admin",
            mobileNo: "017654321",
            email: "admin@gmail.com",
            password: "admin", // Consider hashing the password before storing
            role: "admin",
            isDeleted: false,
        };

        await userServices.createUser(admin);
        console.log("🎉 Admin user created successfully.");
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
};