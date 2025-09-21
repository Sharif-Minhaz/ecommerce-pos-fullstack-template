"use server";

import { connectToDatabase } from "@/db";
import { Rider } from "@/models/RiderModel";
import { Sales } from "@/models/SalesModel";
import { User } from "@/models/UserModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { convertToPlaintObject } from "@/lib/utils";

export type CreateRiderInput = {
	vehicleInfo: {
		vehicleType: "bike" | "car" | "motorcycle" | "scooter";
		brand: string;
		model: string;
		year: number;
		color: string;
		licensePlate: string;
		engineNumber?: string;
		chassisNumber?: string;
		registrationNumber: string;
		insuranceNumber?: string;
		insuranceExpiry?: Date;
		drivingLicenseNumber: string;
		drivingLicenseExpiry: Date;
		vehicleImage?: string;
		licenseImage?: string;
		insuranceImage?: string;
	};
	bankAccount?: {
		accountNumber: string;
		bankName: string;
		accountHolderName: string;
		branchName?: string;
	};
	emergencyContact: {
		name: string;
		phone: string;
		relationship: string;
	};
	serviceAreas: string[];
	workingHours: {
		start: string;
		end: string;
		days: string[];
	};
};

export async function createRiderProfile(input: CreateRiderInput) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		// =============== check if user exists and is a rider ================
		const user = await User.findById(session.user.id);
		if (!user) throw new Error("User not found");
		if (user.userType !== "rider") throw new Error("User must be a rider to create rider profile");

		// =============== check if rider profile already exists ================
		const existingRider = await Rider.findOne({ user: session.user.id });
		if (existingRider) throw new Error("Rider profile already exists");

		const rider = await Rider.create({
			user: new Types.ObjectId(session.user.id),
			vehicleInfo: input.vehicleInfo,
			bankAccount: input.bankAccount,
			emergencyContact: input.emergencyContact,
			serviceAreas: input.serviceAreas,
			workingHours: input.workingHours,
		});

		revalidatePath("/rider/dashboard");

		return { success: true, rider: { _id: String(rider._id) } };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getRiderProfile() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id })
			.populate("user", "name email phoneNumber image")
			.populate({
				path: "deliveries.order",
				populate: {
					path: "user",
					select: "name phoneNumber",
				},
			});

		if (!rider) throw new Error("Rider profile not found");

		return { success: true, rider: convertToPlaintObject(rider) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export type UpdateRiderInput = {
	vehicleInfo?: Partial<CreateRiderInput["vehicleInfo"]>;
	bankAccount?: CreateRiderInput["bankAccount"] | null;
	emergencyContact?: Partial<CreateRiderInput["emergencyContact"]>;
	serviceAreas?: string[];
	workingHours?: Partial<CreateRiderInput["workingHours"]>;
};

export async function updateRiderProfile(input: UpdateRiderInput) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		// =============== merge fields safely ================
		if (input.vehicleInfo) {
			rider.vehicleInfo = { ...(rider.vehicleInfo.toObject?.() || rider.vehicleInfo), ...input.vehicleInfo };
		}
		if (input.bankAccount !== undefined) {
			if (input.bankAccount === null) {
				rider.bankAccount = undefined;
			} else {
				rider.bankAccount = { ...(rider.bankAccount?.toObject?.() || rider.bankAccount), ...input.bankAccount };
			}
		}
		if (input.emergencyContact) {
			rider.emergencyContact = {
				...(rider.emergencyContact?.toObject?.() || rider.emergencyContact),
				...input.emergencyContact,
			};
		}
		if (input.serviceAreas) {
			rider.serviceAreas = input.serviceAreas;
		}
		if (input.workingHours) {
			rider.workingHours = {
				...(rider.workingHours?.toObject?.() || rider.workingHours),
				...input.workingHours,
			} as unknown as typeof rider.workingHours;
		}

		await rider.save();

		revalidatePath("/rider/dashboard");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function updateRiderStatus(status: "available" | "busy" | "offline") {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		rider.status = status;
		await rider.save();

		revalidatePath("/rider/dashboard");

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function updateRiderStatusForm(formData: FormData) {
	try {
		const raw = (formData.get("status") as string) || "";
		const status = raw as "available" | "busy" | "offline";
		if (!status || !["available", "busy", "offline"].includes(status)) {
			throw new Error("Invalid status value");
		}
		return await updateRiderStatus(status);
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getAvailableRiders(city?: string) {
	try {
		await connectToDatabase();

		const query: Record<string, unknown> = {
			isActive: true,
			status: "available",
		};

		if (city) {
			query.serviceAreas = { $in: [city.toLowerCase()] };
		}

		const riders = await Rider.find(query)
			.populate("user", "name phoneNumber")
			.select("vehicleInfo status rating totalDeliveries successfulDeliveries serviceAreas")
			.sort({ rating: -1, successfulDeliveries: -1 });

		return { success: true, riders: convertToPlaintObject(riders) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function assignRiderToOrderForm(formData: FormData) {
	try {
		const orderId = formData.get("orderId") as string;
		const riderId = formData.get("riderId") as string;

		if (!orderId || !riderId) {
			throw new Error("Invalid form data");
		}

		return await assignRiderToOrder(orderId, riderId);
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function assignRiderToOrder(orderId: string, riderId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");

		await connectToDatabase();

		// =============== check if order exists and belongs to vendor ================
		const order = await Sales.findById(orderId).populate({
			path: "items.product",
			select: "vendor",
		});

		if (!order) throw new Error("Order not found");

		// =============== check if order has products from this vendor ================
		const hasVendorProducts = order.items.some(
			(item: { product?: { vendor?: unknown } }) => String(item.product?.vendor) === String(session.user.id)
		);
		if (!hasVendorProducts) throw new Error("Order does not belong to this vendor");

		// =============== check if rider exists and is available ================
		const rider = await Rider.findById(riderId);
		if (!rider) throw new Error("Rider not found");
		if (!rider.isAvailable()) throw new Error("Rider is not available");

		// =============== check if rider works in the delivery area ================
		if (!rider.worksInArea(order.deliveryDetails.city)) {
			throw new Error("Rider does not work in the delivery area");
		}

		// =============== assign rider to order ================
		order.assignedRider = new Types.ObjectId(riderId);
		order.riderAssignmentDate = new Date();
		order.deliveryStatus = "assigned";
		await order.save();

		// =============== add delivery to rider's deliveries ================
		rider.deliveries.push({
			order: new Types.ObjectId(orderId),
			assignedAt: new Date(),
			status: "assigned",
		});
		await rider.save();

		revalidatePath("/my-shop/manage-orders");
		revalidatePath("/rider/dashboard");

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getRiderAssignedOrders() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		const orders = await Sales.find({
			assignedRider: rider._id,
			deliveryStatus: { $in: ["assigned", "accepted", "picked_up"] },
		})
			.populate("user", "name phoneNumber")
			.populate({
				path: "items.product",
				select: "title gallery",
			})
			.sort({ riderAssignmentDate: -1 });

		return { success: true, orders: convertToPlaintObject(orders) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function acceptOrderDelivery(orderId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		const order = await Sales.findById(orderId);
		if (!order) throw new Error("Order not found");
		if (String(order.assignedRider) !== String(rider._id)) {
			throw new Error("Order is not assigned to this rider");
		}
		if (order.deliveryStatus !== "assigned") {
			throw new Error("Order is not in assigned status");
		}

		// =============== update order status ================
		order.deliveryStatus = "accepted";
		order.riderAcceptedDate = new Date();
		await order.save();

		// =============== update rider delivery status ================
		const delivery = rider.deliveries.find((d: { order: unknown }) => String(d.order) === String(orderId));
		if (delivery) {
			delivery.status = "accepted";
			delivery.acceptedAt = new Date();
			await rider.save();
		}

		revalidatePath("/rider/dashboard");
		revalidatePath("/my-shop/manage-orders");

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function rejectOrderDelivery(orderId: string, reason: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		const order = await Sales.findById(orderId);
		if (!order) throw new Error("Order not found");
		if (String(order.assignedRider) !== String(rider._id)) {
			throw new Error("Order is not assigned to this rider");
		}
		if (order.deliveryStatus !== "assigned") {
			throw new Error("Order is not in assigned status");
		}

		// =============== update order status ================
		order.deliveryStatus = "rejected";
		order.riderRejectedDate = new Date();
		order.riderRejectionReason = reason;
		order.assignedRider = undefined; // =============== remove rider assignment ================
		await order.save();

		// =============== update rider delivery status ================
		const delivery = rider.deliveries.find((d: { order: unknown }) => String(d.order) === String(orderId));
		if (delivery) {
			delivery.status = "rejected";
			delivery.rejectedAt = new Date();
			delivery.rejectionReason = reason;
			await rider.save();
		}

		revalidatePath("/rider/dashboard");
		revalidatePath("/my-shop/manage-orders");

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function updateDeliveryStatus(
	orderId: string,
	status: "picked_up" | "delivered" | "failed",
	notes?: string,
	proof?: string
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		const order = await Sales.findById(orderId);
		if (!order) throw new Error("Order not found");
		if (String(order.assignedRider) !== String(rider._id)) {
			throw new Error("Order is not assigned to this rider");
		}

		// =============== update order status ================
		order.deliveryStatus = status;
		if (status === "delivered") {
			order.status = "delivered";
			order.isDelivered = true;
			order.actualDeliveryDate = new Date();
		}
		if (notes) order.deliveryNotes = notes;
		if (proof) order.deliveryProof = proof;
		await order.save();

		// =============== update rider delivery status ================
		const delivery = rider.deliveries.find((d: { order: unknown }) => String(d.order) === String(orderId));
		if (delivery) {
			delivery.status = status;
			if (status === "picked_up") {
				delivery.pickedUpAt = new Date();
			} else if (status === "delivered") {
				delivery.deliveredAt = new Date();
			}
			if (notes) delivery.deliveryNotes = notes;
			if (proof) delivery.deliveryProof = proof;
			await rider.save();
		}

		// =============== update rider stats ================
		if (status === "delivered") {
			await rider.updateDeliveryStats(true);
		} else if (status === "failed") {
			await rider.updateDeliveryStats(false);
		}

		revalidatePath("/rider/dashboard");
		revalidatePath("/my-shop/manage-orders");

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getRiderDeliveryHistory() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const rider = await Rider.findOne({ user: session.user.id });
		if (!rider) throw new Error("Rider profile not found");

		const orders = await Sales.find({
			assignedRider: rider._id,
			deliveryStatus: { $in: ["delivered", "failed", "rejected"] },
		})
			.populate("user", "name phoneNumber")
			.populate({
				path: "items.product",
				select: "title gallery",
			})
			.sort({ riderAssignmentDate: -1 });

		return { success: true, orders: convertToPlaintObject(orders) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}
