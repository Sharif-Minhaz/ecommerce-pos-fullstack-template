"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/models/UserModel";
import { connectToDatabase } from "@/db";

export async function debugSession() {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return { success: false, error: "No session found" };
		}

		// Get user from database
		await connectToDatabase();
		const user = await User.findOne({ email: session.user?.email }).select("-password");

		return {
			success: true,
			session: {
				user: session.user,
				expires: session.expires,
			},
			databaseUser: user
				? {
						_id: user._id,
						email: user.email,
						name: user.name,
						userType: user.userType,
				  }
				: null,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
