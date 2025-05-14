"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { registerUser } from "@/app/actions/auth";

const formSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		userType: z.enum(["user", "vendor"]),
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
		</div>
	);
}
