import mongoose, { Schema, CallbackError } from "mongoose";
import * as argon2 from "argon2";
import { IUser } from "@/types/user";

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters long"],
			maxlength: [50, "Name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
		},
		phoneNumber: {
			type: String,
			trim: true,
			match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid international phone number"], // E.164 format
		},
		is_ban: {
			type: Boolean,
			default: false,
		},
		userType: {
			type: String,
			enum: ["user", "vendor", "admin"],
			default: "user",
		},
		password: {
			type: String,
			required: function (this: IUser) {
				return this.userType !== "user";
			},
			minlength: [6, "Password must be at least 6 characters long"],
			select: false,
		},
		wishlist: [
			{
				type: Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		// Vendor specific fields
		shopName: {
			type: String,
			required: function (this: IUser) {
				return this.userType === "vendor";
			},
			trim: true,
			minlength: [2, "Shop name must be at least 2 characters long"],
			maxlength: [100, "Shop name cannot exceed 100 characters"],
		},
		shopDescription: {
			type: String,
			required: function (this: IUser) {
				return this.userType === "vendor";
			},
			trim: true,
			minlength: [10, "Shop description must be at least 10 characters long"],
			maxlength: [1000, "Shop description cannot exceed 1000 characters"],
		},
		shopImages: [
			{
				type: String,
				required: function (this: IUser) {
					return this.userType === "vendor";
				},
				validate: {
					validator: function (v: string) {
						return /^https?:\/\/.+/.test(v);
					},
					message: "Shop images must be valid URLs",
				},
			},
		],
		registrationNumber: {
			type: String,
			required: function (this: IUser) {
				return this.userType === "vendor";
			},
			unique: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		this.password = await argon2.hash(this.password!, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16, // 64 MiB
			timeCost: 3, // 3 iterations
			parallelism: 1,
		});
		next();
	} catch (error: unknown) {
		next(error as CallbackError);
	}
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
	if (!this.password) return false;
	return argon2.verify(this.password, candidatePassword);
};

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
