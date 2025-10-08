import React, { useMemo } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { showReadAbleCurrency } from "@/lib/utils";
import { PurchaseLite, SalesOrderLite, VendorProductLite } from "@/types/sales";

export default function DashboardOverview({
	historySales,
	historyPurchases,
	products,
}: {
	historySales: SalesOrderLite[];
	historyPurchases: PurchaseLite[];
	products: VendorProductLite[];
}) {
	const totalSalesAmount = useMemo(
		() => historySales.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0),
		[historySales]
	);
	const totalPurchaseAmount = useMemo(
		() => historyPurchases.reduce((sum, pur) => sum + (Number(pur.totalAmount) || 0), 0),
		[historyPurchases]
	);
	const profitAmount = useMemo(() => totalSalesAmount - totalPurchaseAmount, [totalSalesAmount, totalPurchaseAmount]);
	const totalProducts = useMemo(() => products.length, [products]);
	const totalStockUnits = useMemo(() => products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0), [products]);
	const totalStockRetailValue = useMemo(
		() => products.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0), 0),
		[products]
	);

	return (
		<Card>
			<CardContent className="py-6 px-4 sm:px-8">
				<CardTitle className="mb-6 text-xl font-bold">Overview</CardTitle>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="border rounded-md p-4">
						<div className="text-sm text-muted-foreground">Total Sales (delivered)</div>
						<div className="text-2xl font-semibold">৳{showReadAbleCurrency(totalSalesAmount)}</div>
					</div>
					<div className="border rounded-md p-4">
						<div className="text-sm text-muted-foreground">Total Purchases</div>
						<div className="text-2xl font-semibold">৳{showReadAbleCurrency(totalPurchaseAmount)}</div>
					</div>
					<div className="border rounded-md p-4">
						<div className="text-sm text-muted-foreground">Benefit / Profit</div>
						<div className={`text-2xl font-semibold ${profitAmount >= 0 ? "" : "text-red-600"}`}>
							৳{showReadAbleCurrency(profitAmount)}
						</div>
					</div>
					<div className="border rounded-md p-4">
						<div className="text-sm text-muted-foreground">Products</div>
						<div className="text-2xl font-semibold">{totalProducts}</div>
					</div>
					<div className="border rounded-md p-4">
						<div className="text-sm text-muted-foreground">Total Stock Units</div>
						<div className="text-2xl font-semibold">{totalStockUnits}</div>
					</div>
					<div className="border rounded-md p-4">
						<div className="text-sm text-muted-foreground">Inventory Retail Value</div>
						<div className="text-2xl font-semibold">৳{showReadAbleCurrency(totalStockRetailValue)}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
