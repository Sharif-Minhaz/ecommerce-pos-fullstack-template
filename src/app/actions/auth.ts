"use server";

import { User } from "@/models/UserModel";
import { connectToDatabase } from "@/db";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
	try {
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const userType = formData.get("userType") as "user" | "vendor";
		const phoneNumber = formData.get("phoneNumber") as string;
		const shopName = formData.get("shopName") as string;
		const shopDescription = formData.get("shopDescription") as string;
		const registrationNumber = formData.get("registrationNumber") as string;

		await connectToDatabase();

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new Error("User already exists");
		}

		// Create new user
		await User.create({
			name,
			email,
			password,
			userType,
			phoneNumber,
			...(userType === "vendor" && {
				shopName,
				shopDescription,
				registrationNumber,
			}),
		});

		revalidatePath("/auth/login");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
