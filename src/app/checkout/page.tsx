"use client";

import SSLCommerzIcon from "@/assets/ssl.png";
import StripeIcon from "@/assets/stripe.png";
import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSalesOrder, CreateOrderInput } from "../actions/sales";

const cities = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];
const paymentMethods = [
	{ value: "cod", label: "Cash on Delivery", icon: null },
	{ value: "sslcommerz", label: "SSLCommerz", icon: SSLCommerzIcon },
	{ value: "stripe", label: "Stripe", icon: StripeIcon },
];

type CheckoutForm = {
	city: string;
	district: string;
	address: string;
	postalCode: string;
	mapAddress: string;
	mobile: string;
};

export default function CheckoutPage() {
	// =============== get cart info ================
	const { cart, subtotal, totalItems, isMounted, clearCart } = useCart();
	const [step, setStep] = useState(1);
	const [selectedPayment, setSelectedPayment] = useState<string>("");
	const router = useRouter();
	const [placing, setPlacing] = useState<boolean>(false);

	// =============== form setup ================
	const form = useForm<CheckoutForm>({
		defaultValues: {
			city: "",
			district: "",
			address: "",
			postalCode: "",
			mapAddress: "",
			mobile: "",
		},
	});

	// =============== handle form submit ================
	const onSubmit = () => {
		setStep(2);
	};

	// =============== handle payment select ================
	const handlePaymentSelect = (value: string) => {
		setSelectedPayment(value);
	};

	// =============== calculate delivery charge ================
	const deliveryCharge = subtotal >= 300 ? 0 : 20;
	const codCharge = selectedPayment === "cod" ? 10 : 0;
	const total = subtotal + deliveryCharge + codCharge;

	// =============== place order ================
	const handlePlaceOrder = async () => {
		if (!selectedPayment) return;
		try {
			setPlacing(true);
			const payload: CreateOrderInput = {
				items: cart.map((ci) => ({
					productId: String(ci.product._id),
					quantity: ci.quantity,
					unitPrice: ci.product.salePrice ?? ci.product.price,
				})),
				deliveryDetails: {
					address: form.getValues("address"),
					city: form.getValues("city"),
					postalCode: form.getValues("postalCode"),
					phone: form.getValues("mobile"),
				},
				paymentMethod: selectedPayment as CreateOrderInput["paymentMethod"],
				deliveryCharge,
				couponDiscount: 0,
				discount: 0,
				taxAmount: 0,
			};
			const res = await createSalesOrder(payload);
			if (res.success) {
				clearCart();
				router.push("/my-orders");
			} else {
				alert(res.error || "Failed to place order");
			}
		} finally {
			setPlacing(false);
		}
	};

	// =============== loading state ================
	if (!isMounted) {
		return <div className="container mx-auto py-8 px-2 max-w-7xl">Loading...</div>;
	}

	// =============== redirect to cart if empty ================
	// =============== only redirect on step 1 to avoid interfering after order placement ===============
	if (cart.length === 0 && step === 1) {
		router.push("/cart");
		return null;
	}

	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<div className="flex flex-col lg:flex-row gap-8">
				{/* =============== left: form section ================ */}
				<div className="flex-1">
					<Card>
						<CardContent className="py-8 px-4 sm:px-8">
							<div className="flex items-center gap-4 mb-8">
								<div
									className={`rounded-full w-8 h-8 flex items-center justify-center text-white text-base font-bold shadow ${
										step === 1 ? "bg-primary" : "bg-gray-300"
									}`}
								>
									1
								</div>
								<span className={step === 1 ? "font-bold text-base" : "text-gray-500 text-base"}>
									Billing Information
								</span>
								<div className="w-8 h-0.5 bg-gray-200 mx-2" />
								<div
									className={`rounded-full w-8 h-8 flex items-center justify-center text-white text-base font-bold shadow ${
										step === 2 ? "bg-primary" : "bg-gray-300"
									}`}
								>
									2
								</div>
								<span className={step === 2 ? "font-bold text-base" : "text-gray-500 text-base"}>
									Payment
								</span>
							</div>
							{step === 1 && (
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
										{/* =============== city ================ */}
										<FormField
											control={form.control}
											name="city"
											rules={{ required: "City is required" }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>City</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select a city" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{cities.map((city) => (
																<SelectItem key={city} value={city}>
																	{city}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* =============== district/area ================ */}
										<FormField
											control={form.control}
											name="district"
											rules={{ required: "District/Area is required" }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>District/Area</FormLabel>
													<FormControl>
														<Input placeholder="Enter district or area" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* =============== address ================ */}
										<FormField
											control={form.control}
											name="address"
											rules={{ required: "Address is required" }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Address</FormLabel>
													<FormControl>
														<Input placeholder="Enter street or building name" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* =============== postal code ================ */}
										<FormField
											control={form.control}
											name="postalCode"
											rules={{ required: "Postal code is required" }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Postal Code</FormLabel>
													<FormControl>
														<Input placeholder="Enter postal code" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* =============== map address ================ */}
										<FormField
											control={form.control}
											name="mapAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Address (Pin or Map or Type your Address)</FormLabel>
													<FormControl>
														<Input placeholder="Enter address" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* =============== mobile ================ */}
										<FormField
											control={form.control}
											name="mobile"
											rules={{ required: "Mobile number is required" }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Mobile number</FormLabel>
													<FormControl>
														<Input placeholder="Enter mobile number" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button type="submit" className="w-full mt-6 text-base py-3">
											Continue to Payment
										</Button>
									</form>
								</Form>
							)}
							{step === 2 && (
								<div className="space-y-12">
									<div>
										<div className="font-semibold mb-4 text-lg">Select Payment Method</div>
										<div className="flex flex-col sm:flex-row gap-4">
											{paymentMethods.map((pm) => (
												<Button
													key={pm.value}
													variant={selectedPayment === pm.value ? "default" : "outline"}
													onClick={() => handlePaymentSelect(pm.value)}
													type="button"
													className={`flex items-center gap-2 px-6 py-3 text-base border-2 transition-all duration-150 ${
														selectedPayment === pm.value
															? "border-primary shadow-lg"
															: "border-gray-200 hover:border-primary/60"
													}`}
												>
													{pm.icon && (
														<span className="inline-block w-14">
															<Image
																src={pm.icon}
																alt={pm.label}
																className="object-contain"
															/>
														</span>
													)}
													{pm.label}
												</Button>
											))}
										</div>
										{selectedPayment === "cod" && (
											<div className="text-sm text-orange-600 mt-3">
												Cash on Delivery will add 10tk to your total.
											</div>
										)}
									</div>
									{/* =============== back and place order actions ================ */}
									<div className="flex w-full justify-center gap-3">
										<Button
											variant="outline"
											type="button"
											className="text-base py-3 w-[260px]"
											onClick={() => setStep(1)}
										>
											Back to Billing
										</Button>
										<Button
											className="text-base py-3 w-[260px]"
											disabled={!selectedPayment || placing}
											onClick={handlePlaceOrder}
										>
											Place Order
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
				{/* =============== right: order summary ================ */}
				<div className="w-full lg:w-[370px] flex-shrink-0">
					<Card className="sticky top-6">
						<CardContent className="py-8 px-4 sm:px-8">
							<CardTitle className="mb-6 text-xl">Order Summary</CardTitle>
							<div className="flex flex-col gap-2 text-base mb-6">
								<div className="flex justify-between">
									<span>Subtotal ({totalItems} items)</span>
									<span>৳ {subtotal.toFixed(2)}</span>
								</div>
								<div className="flex justify-between">
									<span>Delivery charge</span>
									<span>৳ {deliveryCharge === 0 ? "Free" : deliveryCharge.toFixed(2)}</span>
								</div>
								{selectedPayment === "cod" && (
									<div className="flex justify-between text-orange-600">
										<span>COD charge</span>
										<span>+৳ 10</span>
									</div>
								)}
							</div>
							<div className="flex justify-between font-bold text-2xl mb-6">
								<span>Total</span>
								<span>৳ {total.toFixed(2)}</span>
							</div>
							<div className="divide-y">
								{cart.map((item) => (
									<div key={String(item.product._id)} className="flex items-center gap-3 py-3">
										<img
											src={item.product.gallery[0]}
											alt={item.product.title}
											className="w-14 h-14 object-contain rounded border"
										/>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-base truncate">{item.product.title}</div>
											<div className="text-xs text-gray-500">
												{item.quantity} x ৳
												{(item.product.salePrice ?? item.product.price).toFixed(2)}
											</div>
										</div>
										<div className="font-semibold text-base">
											৳
											{((item.product.salePrice ?? item.product.price) * item.quantity).toFixed(
												2
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
