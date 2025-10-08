import React, { useMemo, useState } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { PurchaseLite, VendorProductLite } from "@/types/sales";
import { createPosPurchase } from "@/app/actions/purchase";
import { getVendorPurchases } from "@/app/actions/purchase";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { showReadAbleCurrency } from "@/lib/utils";

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
	const purchaseSubtotal = useMemo(
		() => purchaseItems.reduce((s, item) => s + (item.purchasePrice || 0) * (item.quantity || 0), 0),
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

	const handleAddPurchaseRow = () =>
		setPurchaseItems((prev) => [...prev, { productId: "", title: "", sku: "", quantity: 1, purchasePrice: 0 }]);
	const handleRemovePurchaseRow = (idx: number) =>
		setPurchaseItems((prev) => (prev.length > 1 ? prev.filter((_, index) => index !== idx) : prev));

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
			items: purchaseItems.map((item) => ({
				productId: item.productId || undefined,
				title: item.title || undefined,
				sku: item.sku || undefined,
				quantity: item.quantity,
				purchasePrice: item.purchasePrice,
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
							<select
								className="col-span-4 border rounded-md h-10 px-2 bg-background"
								value={product.productId}
								onChange={(e) =>
									setPurchaseItems((prev) => {
										const copy = [...prev];
										copy[idx].productId = e.target.value;
										return copy;
									})
								}
							>
								<option value="">-- Select existing --</option>
								{products.map((product) => (
									<option key={product._id} value={product._id}>
										{product.title}
									</option>
								))}
							</select>
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
									className="col-span-12"
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
								onChange={(e) => setPurchaseMeta((v) => ({ ...v, discount: Number(e.target.value) }))}
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
								onChange={(e) => setPurchaseMeta((v) => ({ ...v, vat: Number(e.target.value) }))}
							/>
							<Label>Paid</Label>
							<Input
								type="number"
								value={purchaseMeta.paid}
								onChange={(e) => setPurchaseMeta((v) => ({ ...v, paid: Number(e.target.value) }))}
							/>
						</div>
					</div>
					<div className="mt-4 bg-gray-50 p-4 rounded-md border">
						<div className="flex justify-between text-sm">
							<span>Subtotal</span>
							<span>{showReadAbleCurrency(purchaseSubtotal)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>Total</span>
							<span>{showReadAbleCurrency(purchaseTotal)}</span>
						</div>
					</div>
					<Button className="w-full mt-4" onClick={submitPurchase}>
						Save Purchase
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
