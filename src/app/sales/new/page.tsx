"use client";

import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// =============== dummy data for products and users ================
const dummyProducts = [
	{ id: "1", name: "Pressure Cooker 5L", price: 1200 },
	{ id: "2", name: "Blender 2L", price: 1800 },
	{ id: "3", name: "Steam Iron", price: 900 },
	{ id: "4", name: "Hair Styler", price: 1500 },
];
const dummyUsers = [
	{ id: "u1", name: "John Doe", phone: "+8801712345678", email: "john@example.com" },
	{ id: "u2", name: "Jane Smith", phone: "+8801912345678", email: "jane@example.com" },
];

export default function NewSalesPage() {
	// =============== state for products in sale ================
	const [saleProducts, setSaleProducts] = useState([{ productId: "", quantity: 1 }]);
	const [vat, setVat] = useState(0);
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" });
	const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

	// =============== get selected user/customer ================
	const selectedUser = dummyUsers.find((u) => u.id === selectedUserId);

	// =============== handle product change ================
	const handleProductChange = (idx: number, productId: string) => {
		setSaleProducts((prev) => {
			const updated = [...prev];
			updated[idx].productId = productId;
			return updated;
		});
	};
	const handleQuantityChange = (idx: number, quantity: number) => {
		setSaleProducts((prev) => {
			const updated = [...prev];
			updated[idx].quantity = quantity;
			return updated;
		});
	};
	const handleAddProduct = () => {
		setSaleProducts((prev) => [...prev, { productId: "", quantity: 1 }]);
	};
	const handleRemoveProduct = (idx: number) => {
		setSaleProducts((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
	};

	// =============== subtotal and total calculation ================
	const subtotal = saleProducts.reduce((sum, item) => {
		const prod = dummyProducts.find((p) => p.id === item.productId);
		return sum + (prod ? prod.price * item.quantity : 0);
	}, 0);
	const vatAmount = (subtotal * vat) / 100;
	const total = subtotal + vatAmount;

	// =============== handle customer creation ================
	const handleCreateCustomer = () => {
		if (newCustomer.name && newCustomer.phone) {
			// =============== add to dummy users ================
			dummyUsers.push({
				id: `u${dummyUsers.length + 1}`,
				name: newCustomer.name,
				phone: newCustomer.phone,
				email: newCustomer.email,
			});
			setSelectedUserId(`u${dummyUsers.length}`);
			setIsCreatingCustomer(false);
			setNewCustomer({ name: "", phone: "", email: "" });
		}
	};

	return (
		<div className="container mx-auto py-8 px-2 max-w-3xl">
			<Card>
				<CardContent className="py-8 px-4 sm:px-8">
					<CardTitle className="mb-8 text-2xl font-bold text-center">
						Manual Sales Entry
					</CardTitle>
					{/* =============== customer/user selection ================ */}
					<div className="mb-8">
						<Label className="mb-2 block">Customer (optional)</Label>
						<div className="flex flex-col sm:flex-row gap-4 items-center">
							<Select value={selectedUserId} onValueChange={setSelectedUserId}>
								<SelectTrigger className="w-full sm:w-64">
									<SelectValue placeholder="Select existing customer" />
								</SelectTrigger>
								<SelectContent>
									{dummyUsers.map((user) => (
										<SelectItem key={user.id} value={user.id}>
											{user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<span className="text-gray-400">or</span>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreatingCustomer((v) => !v)}
							>
								{isCreatingCustomer ? "Cancel" : "Create New Customer"}
							</Button>
						</div>
						{isCreatingCustomer && (
							<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
								<Input
									placeholder="Name"
									value={newCustomer.name}
									onChange={(e) =>
										setNewCustomer((c) => ({ ...c, name: e.target.value }))
									}
								/>
								<Input
									placeholder="Phone"
									value={newCustomer.phone}
									onChange={(e) =>
										setNewCustomer((c) => ({ ...c, phone: e.target.value }))
									}
								/>
								<Input
									placeholder="Email (optional)"
									value={newCustomer.email}
									onChange={(e) =>
										setNewCustomer((c) => ({ ...c, email: e.target.value }))
									}
								/>
								<Button
									className="col-span-1 sm:col-span-3 mt-2"
									type="button"
									onClick={handleCreateCustomer}
								>
									Add Customer
								</Button>
							</div>
						)}
						{selectedUser && (
							<div className="mt-4 bg-gray-50 p-4 rounded-lg border text-sm">
								<div>
									<span className="font-semibold">Name:</span> {selectedUser.name}
								</div>
								<div>
									<span className="font-semibold">Phone:</span>{" "}
									{selectedUser.phone}
								</div>
								<div>
									<span className="font-semibold">Email:</span>{" "}
									{selectedUser.email}
								</div>
							</div>
						)}
					</div>
					{/* =============== product selection ================ */}
					<div className="mb-8">
						<Label className="mb-2 block">Products</Label>
						<div className="space-y-4">
							{saleProducts.map((item, idx) => (
								<div
									key={idx}
									className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-lg border"
								>
									<Select
										value={item.productId}
										onValueChange={(val) => handleProductChange(idx, val)}
									>
										<SelectTrigger className="w-full sm:w-64">
											<SelectValue placeholder="Select product" />
										</SelectTrigger>
										<SelectContent>
											{dummyProducts.map((prod) => (
												<SelectItem key={prod.id} value={prod.id}>
													{prod.name} (৳{prod.price})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										type="number"
										min={1}
										className="w-24"
										value={item.quantity}
										onChange={(e) =>
											handleQuantityChange(
												idx,
												Math.max(1, Number(e.target.value))
											)
										}
									/>
									<Button
										type="button"
										variant="ghost"
										onClick={() => handleRemoveProduct(idx)}
										disabled={saleProducts.length === 1}
									>
										Remove
									</Button>
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								className="mt-2"
								onClick={handleAddProduct}
							>
								+ Add Another Product
							</Button>
						</div>
					</div>
					{/* =============== vat and summary ================ */}
					<div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
						<div>
							<Label className="mb-2 block">VAT (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={vat}
								onChange={(e) =>
									setVat(Math.max(0, Math.min(100, Number(e.target.value))))
								}
								className="w-full"
							/>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg border text-lg font-semibold flex flex-col gap-2">
							<div>
								Subtotal:{" "}
								<span className="float-right">৳{subtotal.toFixed(2)}</span>
							</div>
							<div>
								VAT: <span className="float-right">৳{vatAmount.toFixed(2)}</span>
							</div>
							<div>
								Total:{" "}
								<span className="float-right text-primary">
									৳{total.toFixed(2)}
								</span>
							</div>
						</div>
					</div>
					{/* =============== submit button ================ */}
					<Button className="w-full text-lg py-3 mt-4">Save Sale Entry</Button>
				</CardContent>
			</Card>
		</div>
	);
}
