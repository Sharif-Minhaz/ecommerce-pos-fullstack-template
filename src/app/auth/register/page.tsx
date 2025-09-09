"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { registerUser } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import Link from "next/link";

const formSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		userType: z.enum(["user", "vendor", "rider"]),
		phoneNumber: z.string().optional(),
		shopName: z.string().optional(),
		shopDescription: z.string().optional(),
		registrationNumber: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.userType === "vendor") {
				return !!data.shopName && !!data.shopDescription && !!data.registrationNumber;
			}
			return true;
		},
		{
			message: "Vendor fields are required for vendor registration",
			path: ["shopName"],
		}
	);

export default function RegisterPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			userType: "user",
			phoneNumber: "",
			shopName: "",
			shopDescription: "",
			registrationNumber: "",
		},
	});

	const userType = form.watch("userType");

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true);
			const formData = new FormData();
			Object.entries(values).forEach(([key, value]) => {
				if (value !== undefined) {
					formData.append(key, value);
				}
			});

			const result = await registerUser(formData);

			if (!result.success) {
				throw new Error(result.error);
			}

			toast.success("Registration successful! Please login.");
			router.push("/auth/login");
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "Something went wrong");
			} else {
				toast.error("An unknown error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="container max-w-md mx-auto py-10">
			<h1 className="text-2xl font-bold text-center mb-8">Create an Account</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="John Doe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="john@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="userType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Account Type</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select account type" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="user">Customer</SelectItem>
										<SelectItem value="vendor">Vendor</SelectItem>
										<SelectItem value="rider">Rider</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="phoneNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Phone Number (Optional)</FormLabel>
								<FormControl>
									<Input placeholder="+1234567890" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{userType === "vendor" && (
						<>
							<FormField
								control={form.control}
								name="shopName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Shop Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="shopDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Shop Description</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="registrationNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Business Registration Number</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Creating account..." : "Create Account"}
					</Button>
				</form>
			</Form>

			{userType === "user" && (
				<div className="mt-6">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
						</div>
					</div>

					<Button
						variant="outline"
						type="button"
						className="w-full mt-6"
						onClick={() => signIn("google", { callbackUrl: "/" })}
					>
						<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>
				</div>
			)}
		</div>
	);
}
