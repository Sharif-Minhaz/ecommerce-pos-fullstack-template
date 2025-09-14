import nodemailer from "nodemailer";

// =============== email configuration ================
export const emailConfig = {
	host: process.env.MAIL_HOST || "smtp.gmail.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.MAIL_USER || "minhazrabbi93041@gmail.com",
		pass: process.env.MAIL_PASSWORD || "",
	},
	from: process.env.MAIL_FROM || "smmr.career@gmail.com",
};

// =============== create nodemailer transporter ================
export const createTransporter = () => {
	return nodemailer.createTransport(emailConfig);
};

// =============== verify email configuration ================
export const verifyEmailConfig = async () => {
	try {
		const transporter = createTransporter();
		await transporter.verify();
		console.log("Email configuration verified successfully");
		return true;
	} catch (error) {
		console.error("Email configuration verification failed:", error);
		return false;
	}
};
