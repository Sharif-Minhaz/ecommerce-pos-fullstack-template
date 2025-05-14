import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
	if (isConnected) {
		console.info("Using existing database connection");
		return;
	}

	try {
		const db = await mongoose.connect(
			process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017/ecomGuardDB"
		);
		isConnected = db.connections[0].readyState === 1;
		console.info("Database connected successfully");
	} catch (error) {
		console.error("Error connecting to database:", error);
		throw error;
	}
};

export const disconnectFromDatabase = async () => {
	await mongoose.disconnect();
	isConnected = false;
	console.info("Database disconnected successfully");
};
