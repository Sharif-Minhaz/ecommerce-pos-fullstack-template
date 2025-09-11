"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createPosSale } from "@/app/actions/sales";
import { createPosPurchase, getVendorPurchases } from "@/app/actions/purchase";
import { getVendorProducts } from "@/app/actions/product";
import { getVendorDeliveredSales } from "@/app/actions/sales";

export default function PosDashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	// =============== redirect non-vendors ================
	useEffect(() => {
		if (status === "authenticated" && session?.user?.userType !== "vendor") {
			router.push("/auth/login");
		}
	}, [status, session?.user?.userType, router]);

	type VendorProductLite = { _id: string; title: string; price: number; stock: number };
	type SalesOrderLite = {
		_id: string;
		orderNumber: string;
		totalAmount: number;
		items: Array<{ product?: { title?: string; sku?: string } }>;
	};
	type PurchaseLite = {
		_id: string;
		purchaseNumber: string;
		totalAmount: number;
		items: Array<{ product?: { title?: string; sku?: string } }>;
	};

	const [products, setProducts] = useState<VendorProductLite[]>([]);
	const [salesItems, setSalesItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([
		{ productId: "", quantity: 1, unitPrice: 0 },
	]);
	const [saleAdjustments, setSaleAdjustments] = useState({
		deliveryCharge: 0,
		discount: 0,
		taxAmount: 0,
		totalOverride: "",
	});
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [customerCity, setCustomerCity] = useState("");
	const [customerPostalCode, setCustomerPostalCode] = useState("");
	const [saleNotes, setSaleNotes] = useState("");

	const [purchaseItems, setPurchaseItems] = useState<
		Array<{ productId: string; title: string; sku: string; quantity: number; purchasePrice: number }>
	>([{ productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
	const [purchaseMeta, setPurchaseMeta] = useState({
		deliveryCharge: 0,
		discount: 0,
		vat: 0,
		paid: 0,
		discountType: "flat" as "flat" | "percentage",
	});
	const [supplier, setSupplier] = useState({
		name: "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		country: "Bangladesh",
		shopName: "",
		email: "",
	});
	const [purchaseNotes, setPurchaseNotes] = useState("");

	const [historySales, setHistorySales] = useState<SalesOrderLite[]>([]);
	const [historyPurchases, setHistoryPurchases] = useState<PurchaseLite[]>([]);

	// load vendor products and history
	useEffect(() => {
		(async () => {
			if (status !== "authenticated" || session?.user?.userType !== "vendor") return;
			const res = await getVendorProducts();
			if ((res as { success: boolean }).success) {
				const data = res as { success: true; products: VendorProductLite[] };
				setProducts(data.products as unknown as VendorProductLite[]);
			}
			const salesRes = await getVendorDeliveredSales();
			if ((salesRes as { success: boolean }).success) {
				const d = salesRes as { success: true; orders: SalesOrderLite[] };
				setHistorySales(d.orders as SalesOrderLite[]);
			}
			const purRes = await getVendorPurchases();
			if ((purRes as { success: boolean }).success) {
				const d = purRes as { success: true; purchases: PurchaseLite[] };
				setHistoryPurchases(d.purchases as PurchaseLite[]);
			}
		})();
	}, [status, session?.user?.userType]);

	// sales totals
	const salesSubtotal = useMemo(
		() => salesItems.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 0), 0),
		[salesItems]
	);
	const computedSaleTotal = useMemo(() => {
		const discount = Number(saleAdjustments.discount) || 0;
		const deliveryCharge = Number(saleAdjustments.deliveryCharge) || 0;
		const taxAmount = Number(saleAdjustments.taxAmount) || 0;
		const subtotal = Math.max(0, salesSubtotal - discount);
		return subtotal + deliveryCharge + taxAmount;
	}, [salesSubtotal, saleAdjustments]);

	// purchase totals
	const purchaseSubtotal = useMemo(
		() => purchaseItems.reduce((s, it) => s + (it.purchasePrice || 0) * (it.quantity || 0), 0),
		[purchaseItems]
	);
	const purchaseTotal = useMemo(() => {
		const discount = Number(purchaseMeta.discount) || 0;
		const dc = Number(purchaseMeta.deliveryCharge) || 0;
		const vat = Number(purchaseMeta.vat) || 0;
		const discountAmount =
			purchaseMeta.discountType === "percentage" ? (purchaseSubtotal * discount) / 100 : discount;
		const finalSubtotal = Math.max(0, purchaseSubtotal - discountAmount);
		return finalSubtotal + dc + (finalSubtotal * vat) / 100;
	}, [purchaseSubtotal, purchaseMeta]);

	const handleAddSalesRow = () => setSalesItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
	const handleRemoveSalesRow = (idx: number) =>
		setSalesItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

	const handleAddPurchaseRow = () =>
		setPurchaseItems((prev) => [...prev, { productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
	const handleRemovePurchaseRow = (idx: number) =>
		setPurchaseItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

	const submitSale = async () => {
		const valid = salesItems.every((i) => i.productId && i.quantity > 0);
		if (!valid) return;
		const payload = {
			items: salesItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
			customerName,
			customerPhone,
			customerEmail,
			customerAddress,
			customerCity,
			customerPostalCode,
			notes: saleNotes,
			deliveryCharge: Number(saleAdjustments.deliveryCharge) || 0,
			discount: Number(saleAdjustments.discount) || 0,
			taxAmount: Number(saleAdjustments.taxAmount) || 0,
			totalOverride: saleAdjustments.totalOverride === "" ? undefined : Number(saleAdjustments.totalOverride),
		};
		const res = await createPosSale(payload as unknown as Parameters<typeof createPosSale>[0]);
		if ((res as { success: boolean }).success) {
			// reset
			setSalesItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
			setSaleAdjustments({ deliveryCharge: 0, discount: 0, taxAmount: 0, totalOverride: "" });
			setCustomerName("");
			setCustomerPhone("");
			setCustomerEmail("");
			setCustomerAddress("");
			setCustomerCity("");
			setCustomerPostalCode("");
			setSaleNotes("");
			const salesRes = await getVendorDeliveredSales();
			if ((salesRes as { success: boolean }).success) {
				const d = salesRes as { success: true; orders: SalesOrderLite[] };
				setHistorySales(d.orders);
			}
		}
	};

	const submitPurchase = async () => {
		if (
			!supplier.name ||
			!supplier.phone ||
			!supplier.address ||
			!supplier.city ||
			!supplier.postalCode ||
			!supplier.shopName
		)
			return;
		const payload = {
			items: purchaseItems.map((i) => ({
				productId: i.productId || undefined,
				title: i.title || undefined,
				sku: i.sku || undefined,
				quantity: i.quantity,
				purchasePrice: i.purchasePrice,
			})),
			deliveryCharge: Number(purchaseMeta.deliveryCharge) || 0,
			discount: Number(purchaseMeta.discount) || 0,
			discountType: purchaseMeta.discountType,
			vat: Number(purchaseMeta.vat) || 0,
			paid: Number(purchaseMeta.paid) || 0,
			supplierDetails: supplier,
			notes: purchaseNotes,
		};
		const res = await createPosPurchase(payload as unknown as Parameters<typeof createPosPurchase>[0]);
		if ((res as { success: boolean }).success) {
			setPurchaseItems([{ productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
			setPurchaseMeta({ deliveryCharge: 0, discount: 0, vat: 0, paid: 0, discountType: "flat" });
			setSupplier({
				name: "",
				phone: "",
				address: "",
				city: "",
				postalCode: "",
				country: "Bangladesh",
				shopName: "",
				email: "",
			});
			setPurchaseNotes("");
			const purRes = await getVendorPurchases();
			if ((purRes as { success: boolean }).success) {
				const d = purRes as { success: true; purchases: PurchaseLite[] };
				setHistoryPurchases(d.purchases);
			}
		}
	};

	if (status === "loading") return null;
	if (!session || session.user?.userType !== "vendor") return null;

	return (
		<div className="container mx-auto py-6 px-2 max-w-6xl">
			<Tabs defaultValue="sales">
				<TabsList>
					<TabsTrigger value="sales">Sales</TabsTrigger>
					<TabsTrigger value="purchase">Purchase</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>

				<TabsContent value="sales">
					<Card>
						<CardContent className="py-6 px-4 sm:px-8">
							<CardTitle className="mb-6 text-xl font-bold">Create POS Sale</CardTitle>
							<div className="space-y-4">
								<div className="grid grid-cols-12 gap-3 font-medium text-sm text-muted-foreground">
									<div className="col-span-6">Product</div>
									<div className="col-span-2">Unit Price</div>
									<div className="col-span-2">Qty</div>
									<div className="col-span-2 text-right">Total</div>
								</div>
								{salesItems.map((row, idx) => {
									return (
										<div
											key={idx}
											className="grid grid-cols-12 gap-3 items-center border rounded-md p-3"
										>
											<select
												className="col-span-6 border rounded-md h-10 px-2 bg-background"
												value={row.productId}
												onChange={(e) => {
													const id = e.target.value;
													const p = products.find((pr) => pr._id === id);
													setSalesItems((prev) => {
														const copy = [...prev];
														copy[idx] = {
															...copy[idx],
															productId: id,
															unitPrice: p ? p.price : 0,
														};
														return copy;
													});
												}}
											>
												<option value="">Select product</option>
												{products.map((p) => (
													<option key={p._id} value={p._id}>
														{p.title} (Stock: {p.stock})
													</option>
												))}
											</select>
											<Input
												className="col-span-2"
												type="number"
												value={row.unitPrice}
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
												value={row.quantity}
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
												{((row.unitPrice || 0) * (row.quantity || 0)).toFixed(2)}
											</div>
											<div className="col-span-12 flex justify-between mt-2">
												<Button
													variant="ghost"
													onClick={() => handleRemoveSalesRow(idx)}
													disabled={salesItems.length === 1}
												>
													Remove
												</Button>
											</div>
										</div>
									);
								})}
								<Button variant="outline" onClick={handleAddSalesRow}>
									+ Add Item
								</Button>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
									<div className="space-y-2">
										<Label>Customer Name</Label>
										<Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
										<Label>Phone (optional)</Label>
										<Input
											value={customerPhone}
											onChange={(e) => setCustomerPhone(e.target.value)}
										/>
										<Label>Email (optional)</Label>
										<Input
											value={customerEmail}
											onChange={(e) => setCustomerEmail(e.target.value)}
										/>
										<Label>Notes</Label>
										<Input value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} />
									</div>
									<div className="space-y-2">
										<Label>Delivery Charge</Label>
										<Input
											type="number"
											value={saleAdjustments.deliveryCharge}
											onChange={(e) =>
												setSaleAdjustments((v) => ({
													...v,
													deliveryCharge: Number(e.target.value),
												}))
											}
										/>
										<Label>Discount</Label>
										<Input
											type="number"
											value={saleAdjustments.discount}
											onChange={(e) =>
												setSaleAdjustments((v) => ({ ...v, discount: Number(e.target.value) }))
											}
										/>
										<Label>Tax Amount</Label>
										<Input
											type="number"
											value={saleAdjustments.taxAmount}
											onChange={(e) =>
												setSaleAdjustments((v) => ({ ...v, taxAmount: Number(e.target.value) }))
											}
										/>
										<Label>Total Override (optional)</Label>
										<Input
											type="number"
											value={saleAdjustments.totalOverride}
											onChange={(e) =>
												setSaleAdjustments((v) => ({ ...v, totalOverride: e.target.value }))
											}
										/>
										<Label>Address (optional)</Label>
										<Input
											value={customerAddress}
											onChange={(e) => setCustomerAddress(e.target.value)}
										/>
										<Label>City (optional)</Label>
										<Input value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} />
										<Label>Postal Code (optional)</Label>
										<Input
											value={customerPostalCode}
											onChange={(e) => setCustomerPostalCode(e.target.value)}
										/>
									</div>
								</div>
								<div className="mt-4 bg-gray-50 p-4 rounded-md border">
									<div className="flex justify-between text-sm">
										<span>Subtotal</span>
										<span>{salesSubtotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Computed Total</span>
										<span>{computedSaleTotal.toFixed(2)}</span>
									</div>
								</div>
								<Button className="w-full mt-4" onClick={submitSale}>
									Save Sale
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="purchase">
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
								{purchaseItems.map((row, idx) => (
									<div
										key={idx}
										className="grid grid-cols-12 gap-3 items-center border rounded-md p-3"
									>
										<select
											className="col-span-4 border rounded-md h-10 px-2 bg-background"
											value={row.productId}
											onChange={(e) =>
												setPurchaseItems((prev) => {
													const copy = [...prev];
													copy[idx].productId = e.target.value;
													return copy;
												})
											}
										>
											<option value="">-- Select existing --</option>
											{products.map((p) => (
												<option key={p._id} value={p._id}>
													{p.title}
												</option>
											))}
										</select>
										<Input
											className="col-span-2"
											type="number"
											value={row.purchasePrice}
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
											value={row.quantity}
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
											value={row.sku}
											onChange={(e) =>
												setPurchaseItems((prev) => {
													const copy = [...prev];
													copy[idx].sku = e.target.value;
													return copy;
												})
											}
										/>
										<div className="col-span-2 text-right font-medium">
											{((row.purchasePrice || 0) * (row.quantity || 0)).toFixed(2)}
										</div>
										<div className="col-span-12 grid grid-cols-12 gap-3">
											<Input
												className="col-span-12"
												placeholder="Product title (if new)"
												value={row.title}
												onChange={(e) =>
													setPurchaseItems((prev) => {
														const copy = [...prev];
														copy[idx].title = e.target.value;
														return copy;
													})
												}
											/>
										</div>
										<div className="col-span-12 flex justify-between mt-2">
											<Button
												variant="ghost"
												onClick={() => handleRemovePurchaseRow(idx)}
												disabled={purchaseItems.length === 1}
											>
												Remove
											</Button>
										</div>
									</div>
								))}
								<Button variant="outline" onClick={handleAddPurchaseRow}>
									+ Add Item
								</Button>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
									<div className="space-y-2">
										<Label>Supplier Name</Label>
										<Input
											value={supplier.name}
											onChange={(e) => setSupplier((v) => ({ ...v, name: e.target.value }))}
										/>
										<Label>Phone</Label>
										<Input
											value={supplier.phone}
											onChange={(e) => setSupplier((v) => ({ ...v, phone: e.target.value }))}
										/>
										<Label>Address</Label>
										<Input
											value={supplier.address}
											onChange={(e) => setSupplier((v) => ({ ...v, address: e.target.value }))}
										/>
										<Label>City</Label>
										<Input
											value={supplier.city}
											onChange={(e) => setSupplier((v) => ({ ...v, city: e.target.value }))}
										/>
										<Label>Postal Code</Label>
										<Input
											value={supplier.postalCode}
											onChange={(e) => setSupplier((v) => ({ ...v, postalCode: e.target.value }))}
										/>
										<Label>Shop Name</Label>
										<Input
											value={supplier.shopName}
											onChange={(e) => setSupplier((v) => ({ ...v, shopName: e.target.value }))}
										/>
										<Label>Email (optional)</Label>
										<Input
											value={supplier.email}
											onChange={(e) => setSupplier((v) => ({ ...v, email: e.target.value }))}
										/>
									</div>
									<div className="space-y-2">
										<Label>Delivery Charge</Label>
										<Input
											type="number"
											value={purchaseMeta.deliveryCharge}
											onChange={(e) =>
												setPurchaseMeta((v) => ({
													...v,
													deliveryCharge: Number(e.target.value),
												}))
											}
										/>
										<Label>Discount</Label>
										<Input
											type="number"
											value={purchaseMeta.discount}
											onChange={(e) =>
												setPurchaseMeta((v) => ({ ...v, discount: Number(e.target.value) }))
											}
										/>
										<Label>Discount Type</Label>
										<select
											className="w-full border rounded-md h-10 px-2 bg-background"
											value={purchaseMeta.discountType}
											onChange={(e) =>
												setPurchaseMeta((v) => ({
													...v,
													discountType: e.target.value as "flat" | "percentage",
												}))
											}
										>
											<option value="flat">Flat</option>
											<option value="percentage">Percentage</option>
										</select>
										<Label>VAT (%)</Label>
										<Input
											type="number"
											value={purchaseMeta.vat}
											onChange={(e) =>
												setPurchaseMeta((v) => ({ ...v, vat: Number(e.target.value) }))
											}
										/>
										<Label>Paid</Label>
										<Input
											type="number"
											value={purchaseMeta.paid}
											onChange={(e) =>
												setPurchaseMeta((v) => ({ ...v, paid: Number(e.target.value) }))
											}
										/>
									</div>
								</div>
								<div className="mt-4 bg-gray-50 p-4 rounded-md border">
									<div className="flex justify-between text-sm">
										<span>Subtotal</span>
										<span>{purchaseSubtotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Total</span>
										<span>{purchaseTotal.toFixed(2)}</span>
									</div>
								</div>
								<Button className="w-full mt-4" onClick={submitPurchase}>
									Save Purchase
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<Card>
							<CardContent className="py-6 px-4 sm:px-8">
								<CardTitle className="mb-4 text-lg font-bold">Delivered Sales</CardTitle>
								<div className="space-y-2 text-sm">
									{historySales.length === 0 && <div>No delivered sales yet.</div>}
									{historySales.map((o) => (
										<div key={o._id} className="border rounded-md p-3">
											<div className="flex justify-between">
												<div>#{o.orderNumber}</div>
												<div className="font-medium">৳{o.totalAmount}</div>
											</div>
											<div className="text-muted-foreground">Items: {o.items?.length || 0}</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="py-6 px-4 sm:px-8">
								<CardTitle className="mb-4 text-lg font-bold">Purchases</CardTitle>
								<div className="space-y-2 text-sm">
									{historyPurchases.length === 0 && <div>No purchases yet.</div>}
									{historyPurchases.map((p) => (
										<div key={p._id} className="border rounded-md p-3">
											<div className="flex justify-between">
												<div>#{p.purchaseNumber}</div>
												<div className="font-medium">৳{p.totalAmount}</div>
											</div>
											<div className="text-muted-foreground">Items: {p.items?.length || 0}</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
