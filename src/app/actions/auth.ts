"use server";

import { User } from "@/models/UserModel";
import { connectToDatabase } from "@/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function registerUser(formData: FormData) {
	try {
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const userType = formData.get("userType") as "user" | "vendor" | "rider";
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

export async function getUserProfile() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();
		const user = await User.findOne({ email: session.user.email }).select("-password");

		if (!user) {
			throw new Error("User not found");
		}

		return { success: true, user };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function updateUserProfile(formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		const name = formData.get("name") as string;
		const phoneNumber = formData.get("phoneNumber") as string;

		const updateData: Partial<{
			name: string;
			phoneNumber: string;
		}> = {
			name,
			phoneNumber,
		};

		const updatedUser = await User.findOneAndUpdate({ email: session.user.email }, updateData, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedUser) {
			throw new Error("Failed to update user");
		}

		revalidatePath("/profile");
		return { success: true, user: updatedUser };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
