import NextAuth, { type NextAuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { User } from "@/models/UserModel";
import { connectToDatabase } from "@/db";
import { MongoClient } from "mongodb";
import { Adapter } from "next-auth/adapters";

if (!process.env.MONGODB_CONNECTION_STRING) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_CONNECTION_STRING"');
}

const uri = process.env.MONGODB_CONNECTION_STRING;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
	const globalWithMongo = global as typeof globalThis & {
		_mongoClientPromise?: Promise<MongoClient>;
	};

	if (!globalWithMongo._mongoClientPromise) {
		client = new MongoClient(uri, options);
		globalWithMongo._mongoClientPromise = client.connect();
	}
	clientPromise = globalWithMongo._mongoClientPromise;
} else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			userType: string;
		} & DefaultSession["user"];
	}

	interface User {
		userType: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		userType: string;
	}
}

export const authOptions: NextAuthOptions = {
	adapter: MongoDBAdapter(clientPromise) as Adapter,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			allowDangerousEmailAccountLinking: true,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter an email and password");
				}

				await connectToDatabase();

				const user = await User.findOne({ email: credentials.email }).select("+password");
				if (!user) {
					throw new Error("No user found with this email");
				}

				if (user.userType === "user") {
					throw new Error("Please login with Google");
				}

				const isValid = await user.comparePassword(credentials.password);
				if (!isValid) {
					throw new Error("Invalid password");
				}

				return {
					id: user._id.toString(),
					name: user.name,
					email: user.email,
					image: user.image,
					userType: user.userType,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				// Initial sign-in: user object is available
				token.id = user.id;
				token.userType = user.userType;
			} else if (token.email) {
				// Subsequent requests: fetch user from database to get userType
				try {
					await connectToDatabase();
					const dbUser = await User.findOne({ email: token.email }).select("userType");
					if (dbUser) {
						token.userType = dbUser.userType;
					}
				} catch (error) {
					console.error("Error fetching user in JWT callback:", error);
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.userType = token.userType;
			}
			return session;
		},
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				await connectToDatabase();
				const existingUser = await User.findOne({ email: user.email });

				if (existingUser) {
					// If user exists but was created with credentials, prevent Google login
					if (existingUser.userType === "vendor") {
						return false;
					}
					// Update the existing user with Google info if needed
					await User.findOneAndUpdate(
						{ email: user.email },
						{
							$set: {
								name: user.name,
								image: user.image,
							},
						}
					);
					return true;
				}

				// Create new user for Google sign in
				await User.create({
					name: user.name,
					email: user.email,
					image: user.image,
					userType: "user",
				});
				return true;
			}

			if (account?.provider === "credentials") {
				const dbUser = await User.findOne({ email: user.email });
				if (dbUser?.userType === "user") {
					return false; // Prevent credentials login for Google users
				}
			}

			return true;
		},
	},
	pages: {
		signIn: "/auth/login",
		error: "/auth/error",
	},
	session: {
		strategy: "jwt" as const,
		maxAge: 60 * 60 * 24 * 30, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
