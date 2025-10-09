import React, { useMemo, useState } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { SalesOrderLite, VendorProductLite } from "@/types/sales";
import { createPosSale, getVendorDeliveredSales } from "@/app/actions/sales";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { showReadAbleCurrency } from "@/lib/utils";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { salesFormSchema, SalesFormValues } from "@/schema/sales-schema";
import { X } from "lucide-react";

export default function SalesForm({
	setHistorySales,
	products,
}: {
	products: VendorProductLite[];
	setHistorySales: (sales: SalesOrderLite[]) => void;
}) {
	const [salesItems, setSalesItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([
		{ productId: "", quantity: 1, unitPrice: 0 },
	]);

	const form = useForm({
		resolver: zodResolver(salesFormSchema),
		defaultValues: {
			customerName: "",
			customerPhone: "",
			customerEmail: "",
			customerAddress: "",
			customerCity: "",
			customerPostalCode: "",
			saleNotes: "",
			deliveryCharge: 0,
			discount: 0,
			taxAmount: 0,
			totalOverride: "",
			paid: 0,
		},
	});

	// sales totals
	const salesSubtotal = useMemo(
		() => salesItems.reduce((s, item) => s + (item.unitPrice || 0) * (item.quantity || 0), 0),
		[salesItems]
	);
	// watch individual inputs so changes re-compute live
	const watchDiscount = Number(form.watch("discount")) || 0;
	const watchDeliveryCharge = Number(form.watch("deliveryCharge")) || 0;
	const watchTaxAmount = Number(form.watch("taxAmount")) || 0;
	const watchPaid = Number(form.watch("paid")) || 0;
	const watchTotalOverride = form.watch("totalOverride");

	const computedSaleTotal = useMemo(() => {
		const subtotal = Math.max(0, salesSubtotal - watchDiscount);
		return subtotal + watchDeliveryCharge + watchTaxAmount;
	}, [salesSubtotal, watchDiscount, watchDeliveryCharge, watchTaxAmount]);

	const effectiveTotal = useMemo(() => {
		if (watchTotalOverride !== "" && watchTotalOverride != null) {
			const ov = Number(watchTotalOverride);
			if (Number.isFinite(ov) && ov >= 0) return ov;
		}
		return computedSaleTotal;
	}, [watchTotalOverride, computedSaleTotal]);

	const computedDue = useMemo(() => Math.max(0, effectiveTotal - watchPaid), [effectiveTotal, watchPaid]);
	const computedReturn = useMemo(() => Math.max(0, watchPaid - effectiveTotal), [effectiveTotal, watchPaid]);

	const handleAddSalesRow = () => setSalesItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);

	const handleRemoveSalesRow = (idx: number) => {
		setSalesItems((prev) => {
			if (prev.length > 1) return prev.filter((_, index) => index !== idx);
			const copy = [...prev];
			copy[idx] = { productId: "", quantity: 1, unitPrice: 0 };
			return copy;
		});
		form.resetField("totalOverride");
	};

	const onSubmit = async (values: SalesFormValues) => {
		const valid = salesItems.every((item) => item.productId && item.quantity > 0);

		if (!valid) {
			toast.error("Add at least one product");
			return;
		}

		const payload = {
			items: salesItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
			})),

			customerName: values.customerName,
			customerPhone: values.customerPhone,
			customerEmail: values.customerEmail,
			customerAddress: values.customerAddress,
			customerCity: values.customerCity,
			customerPostalCode: values.customerPostalCode,
			notes: values.saleNotes,
			deliveryCharge: Number(values.deliveryCharge) || 0,
			discount: Number(values.discount) || 0,
			taxAmount: Number(values.taxAmount) || 0,
			totalOverride: values.totalOverride === "" ? undefined : Number(values.totalOverride),
			paid: Number(values.paid) || 0,
		};

		const res = await createPosSale(payload as unknown as Parameters<typeof createPosSale>[0]);
		if ((res as { success: boolean }).success) {
			// =============== sale created successfully ================
			toast.success("Sale created");
			setSalesItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
			form.reset();

			const salesRes = await getVendorDeliveredSales();
			if ((salesRes as { success: boolean }).success) {
				const data = salesRes as { success: true; orders: SalesOrderLite[] };
				setHistorySales(data.orders);
			}
		} else {
			toast.error("Failed to create sale");
		}
	};

	const handleProductSelectChange = (idx: number, id: string) => {
		const singleProduct = products.find((product) => product._id === id);

		setSalesItems((prev) => {
			const previousProducts = [...prev];
			previousProducts[idx] = {
				...previousProducts[idx],
				productId: id,
				unitPrice: singleProduct ? singleProduct.price : 0,
			};
			return previousProducts;
		});
	};

	return (
		<Card>
			<CardContent className="py-6 px-4 sm:px-8">
				<CardTitle className="mb-6 text-xl font-bold">Create POS Sale</CardTitle>
				<div className="space-y-4">
					<div className="grid grid-cols-12 gap-3 font-medium text-sm text-muted-foreground">
						<div className="col-span-4">Product</div>
						<div className="col-span-2">Unit Price</div>
						<div className="col-span-2">Qty</div>
						<div className="col-span-2 text-right">Total</div>
						<div className="col-span-2" />
					</div>
					{salesItems.map((item, idx) => {
						return (
							<div key={idx} className="grid grid-cols-12 gap-3 items-center border rounded-md p-3">
								<Select
									value={item.productId || ""}
									onValueChange={(id) => handleProductSelectChange(idx, id)}
								>
									<SelectTrigger className="col-span-4 w-full">
										<SelectValue placeholder="Select product" />
									</SelectTrigger>
									<SelectContent>
										{products.map((product) => (
											<SelectItem key={product._id} value={product._id}>
												{product.title} (Stock: {product.stock})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									className="col-span-2"
									type="number"
									value={item.unitPrice}
									onChange={(e) =>
										setSalesItems((prev) => {
											const copy = [...prev];
											copy[idx] = { ...copy[idx], unitPrice: Number(e.target.value) };
											return copy;
										})
									}
								/>
								<Input
									className="col-span-2"
									type="number"
									min={1}
									value={item.quantity}
									onChange={(e) =>
										setSalesItems((prev) => {
											const copy = [...prev];
											copy[idx] = {
												...copy[idx],
												quantity: Math.max(1, Number(e.target.value)),
											};
											return copy;
										})
									}
								/>
								<div className="col-span-2 text-right font-medium">
									{showReadAbleCurrency((item.unitPrice || 0) * (item.quantity || 0))}
								</div>
								<div className="col-span-2 flex items-center justify-end">
									{idx !== 0 && (
										<Button
											variant="outline"
											size="icon"
											aria-label="remove"
											className="text-red-500"
											onClick={() => handleRemoveSalesRow(idx)}
										>
											<X />
										</Button>
									)}
								</div>
							</div>
						);
					})}
					<Button variant="outline" onClick={handleAddSalesRow}>
						+ Add Item
					</Button>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
						>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="customerName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Customer Name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerPhone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone (optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerEmail"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email (optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="saleNotes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notes</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="deliveryCharge"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Delivery Charge</FormLabel>
											<FormControl>
												<Input
													type="number"
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="discount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Discount</FormLabel>
											<FormControl>
												<Input
													type="number"
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="taxAmount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tax Amount</FormLabel>
											<FormControl>
												<Input
													type="number"
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="totalOverride"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Total Override (optional)</FormLabel>
											<FormControl>
												<Input type="number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address (optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerCity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City (optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerPostalCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Postal Code (optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="col-span-1 sm:col-span-2 mt-4 bg-gray-50 p-4 rounded-md border">
								<div className="flex justify-between text-sm">
									<span>Subtotal</span>
									<span>{showReadAbleCurrency(salesSubtotal)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Computed Total</span>
									<span>{showReadAbleCurrency(computedSaleTotal)}</span>
								</div>
								{watchTotalOverride !== "" && (
									<div className="flex justify-between text-sm">
										<span>Final Total</span>
										<span>{showReadAbleCurrency(effectiveTotal)}</span>
									</div>
								)}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
									<div>
										<FormField
											control={form.control}
											name="paid"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Paid</FormLabel>
													<FormControl>
														<Input
															type="number"
															value={field.value}
															onChange={(e) => field.onChange(e.target.value)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="flex flex-col justify-end">
										<div className="flex justify-between text-sm">
											<span>Due</span>
											<span>{showReadAbleCurrency(computedDue)}</span>
										</div>
									</div>
									<div className="flex flex-col justify-end">
										<div className="flex justify-between text-sm">
											<span>Return</span>
											<span>{showReadAbleCurrency(computedReturn)}</span>
										</div>
									</div>
								</div>
							</div>
							<div className="col-span-1 sm:col-span-2">
								<Button className="w-full mt-4" type="submit" disabled={form.formState.isSubmitting}>
									Save Sale
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</CardContent>
		</Card>
	);
}
