import React, { useMemo, useState } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { PurchaseLite, VendorProductLite } from "@/types/sales";
import { createPosPurchase } from "@/app/actions/purchase";
import { getVendorPurchases } from "@/app/actions/purchase";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { showReadAbleCurrency } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseFormSchema, PurchaseFormValues } from "@/schema/purchase-schema";

export default function PurchaseForm({
	products,
	setHistoryPurchases,
}: {
	products: VendorProductLite[];
	setHistoryPurchases: (purchases: PurchaseLite[]) => void;
}) {
	const [purchaseItems, setPurchaseItems] = useState<
		Array<{ productId: string; title: string; sku: string; quantity: number; purchasePrice: number }>
	>([{ productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
	const form = useForm<PurchaseFormValues>({
		resolver: zodResolver(purchaseFormSchema) as Resolver<PurchaseFormValues>,
		defaultValues: {
			supplierName: "",
			phone: "",
			address: "",
			city: "",
			postalCode: "",
			country: "Bangladesh",
			shopName: "",
			email: "",
			deliveryCharge: 0,
			discount: 0,
			discountType: "flat",
			vat: 0,
			paid: 0,
			notes: "",
		},
	});
	const purchaseSubtotal = useMemo(
		() => purchaseItems.reduce((s, item) => s + (item.purchasePrice || 0) * (item.quantity || 0), 0),
		[purchaseItems]
	);
	const watchDiscount = Number(form.watch("discount")) || 0;
	const watchDC = Number(form.watch("deliveryCharge")) || 0;
	const watchVat = Number(form.watch("vat")) || 0;
	const watchType = form.watch("discountType");
	const watchPaid = Number(form.watch("paid")) || 0;

	const purchaseTotal = useMemo(() => {
		const discountAmount = watchType === "percentage" ? (purchaseSubtotal * watchDiscount) / 100 : watchDiscount;
		const finalSubtotal = Math.max(0, purchaseSubtotal - discountAmount);
		return finalSubtotal + watchDC + (finalSubtotal * watchVat) / 100;
	}, [purchaseSubtotal, watchDiscount, watchType, watchDC, watchVat]);

	const purchaseDue = useMemo(() => Math.max(0, purchaseTotal - watchPaid), [purchaseTotal, watchPaid]);
	const purchaseReturn = useMemo(() => Math.max(0, watchPaid - purchaseTotal), [purchaseTotal, watchPaid]);

	const handleAddPurchaseRow = () =>
		setPurchaseItems((prev) => [...prev, { productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
	const handleRemovePurchaseRow = (idx: number) =>
		setPurchaseItems((prev) => {
			if (prev.length > 1) return prev.filter((_, index) => index !== idx);
			const copy = [...prev];
			copy[idx] = { productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 };
			return copy;
		});

	const submitPurchase = async (values: PurchaseFormValues) => {
		const payload = {
			items: purchaseItems.map((item) => ({
				productId: item.productId || undefined,
				title: item.title || undefined,
				sku: item.sku || undefined,
				quantity: item.quantity,
				purchasePrice: item.purchasePrice,
			})),
			deliveryCharge: Number(values.deliveryCharge) || 0,
			discount: Number(values.discount) || 0,
			discountType: values.discountType,
			vat: Number(values.vat) || 0,
			paid: Number(values.paid) || 0,
			supplierDetails: {
				name: values.supplierName,
				phone: values.phone,
				address: values.address,
				city: values.city,
				postalCode: values.postalCode,
				country: values.country || "Bangladesh",
				shopName: values.shopName,
				email: values.email || undefined,
			},
			notes: values.notes || "",
		};
		const res = await createPosPurchase(payload as unknown as Parameters<typeof createPosPurchase>[0]);
		if ((res as { success: boolean }).success) {
			setPurchaseItems([{ productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
			form.reset();
			const purRes = await getVendorPurchases();
			if ((purRes as { success: boolean }).success) {
				const d = purRes as { success: true; purchases: PurchaseLite[] };
				setHistoryPurchases(d.purchases);
			}
		}
	};
	return (
		<Card>
			<CardContent className="py-6 px-4 sm:px-8">
				<CardTitle className="mb-6 text-xl font-bold">Record Purchase</CardTitle>
				<div className="space-y-4">
					<div className="grid grid-cols-12 gap-3 font-medium text-sm text-muted-foreground">
						<div className="col-span-4">Product (select or type title/sku)</div>
						<div className="col-span-2">Purchase Price</div>
						<div className="col-span-2">Qty</div>
						<div className="col-span-2">SKU</div>
						<div className="col-span-2 text-right">Total</div>
					</div>
					{purchaseItems.map((product, idx) => (
						<div key={idx} className="grid grid-cols-12 gap-3 items-center border rounded-md p-3">
							<Select
								value={product.productId}
								onValueChange={(value) =>
									setPurchaseItems((prev) => {
										const copy = [...prev];
										copy[idx].productId = value;
										return copy;
									})
								}
							>
								<SelectTrigger className="col-span-4 w-full">
									<SelectValue placeholder="-- Select existing --" />
								</SelectTrigger>
								<SelectContent>
									{products.map((p) => (
										<SelectItem key={p._id} value={p._id}>
											{p.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								className="col-span-2"
								type="number"
								value={product.purchasePrice}
								onChange={(e) =>
									setPurchaseItems((prev) => {
										const copy = [...prev];
										copy[idx].purchasePrice = Number(e.target.value);
										return copy;
									})
								}
							/>
							<Input
								className="col-span-2"
								type="number"
								min={1}
								value={product.quantity}
								onChange={(e) =>
									setPurchaseItems((prev) => {
										const copy = [...prev];
										copy[idx].quantity = Math.max(1, Number(e.target.value));
										return copy;
									})
								}
							/>
							<Input
								className="col-span-2"
								placeholder="SKU (optional)"
								value={product.sku}
								onChange={(e) =>
									setPurchaseItems((prev) => {
										const copy = [...prev];
										copy[idx].sku = e.target.value;
										return copy;
									})
								}
							/>
							<div className="col-span-2 text-right font-medium">
								{showReadAbleCurrency((product.purchasePrice || 0) * (product.quantity || 0))}
							</div>
							<div className="col-span-12 grid grid-cols-12 gap-3">
								<Input
									className="col-span-10"
									placeholder="Product title (if new)"
									value={product.title}
									onChange={(e) =>
										setPurchaseItems((prev) => {
											const copy = [...prev];
											copy[idx].title = e.target.value;
											return copy;
										})
									}
								/>
								<div className="col-span-2 flex justify-end">
									<Button variant="outline" onClick={() => handleRemovePurchaseRow(idx)}>
										Remove
									</Button>
								</div>
							</div>
						</div>
					))}
					<Button variant="outline" onClick={handleAddPurchaseRow}>
						+ Add Item
					</Button>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(submitPurchase)}
							className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
						>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="supplierName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Supplier Name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="postalCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Postal Code</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
									name="email"
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
									name="discountType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Discount Type</FormLabel>
											<Select value={field.value} onValueChange={(val) => field.onChange(val)}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Discount type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="flat">Flat</SelectItem>
													<SelectItem value="percentage">Percentage</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="vat"
									render={({ field }) => (
										<FormItem>
											<FormLabel>VAT (%)</FormLabel>
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
							<div className="col-span-1 sm:col-span-2">
								<FormField
									control={form.control}
									name="notes"
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
							<div className="col-span-1 sm:col-span-2 mt-4 bg-gray-50 p-4 rounded-md border">
								<div className="flex justify-between text-sm">
									<span>Subtotal</span>
									<span>{showReadAbleCurrency(purchaseSubtotal)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Total</span>
									<span>{showReadAbleCurrency(purchaseTotal)}</span>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
									<div className="flex flex-col justify-end">
										<div className="flex justify-between text-sm">
											<span>Due</span>
											<span>{showReadAbleCurrency(purchaseDue)}</span>
										</div>
									</div>
									<div className="flex flex-col justify-end">
										<div className="flex justify-between text-sm">
											<span>Return</span>
											<span>{showReadAbleCurrency(purchaseReturn)}</span>
										</div>
									</div>
								</div>
							</div>
							<div className="col-span-1 sm:col-span-2">
								<Button className="w-full mt-4" type="submit" disabled={form.formState.isSubmitting}>
									Save Purchase
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</CardContent>
		</Card>
	);
}
