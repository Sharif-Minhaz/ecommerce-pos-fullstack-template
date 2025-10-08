import React from "react";
import { Card, CardTitle, CardContent } from "../ui/card";
import { showReadAbleCurrency } from "@/lib/utils";
import { PurchaseLite } from "@/types/sales";
import { SalesOrderLite } from "@/types/sales";

export default function History({
	historySales,
	historyPurchases,
}: {
	historySales: SalesOrderLite[];
	historyPurchases: PurchaseLite[];
}) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<Card>
				<CardContent className="py-6 px-4 sm:px-8">
					<CardTitle className="mb-4 text-lg font-bold">Delivered Sales</CardTitle>
					<div className="space-y-2 text-sm">
						{historySales.length === 0 && <div>No delivered sales yet.</div>}
						{historySales.map((order) => (
							<div key={order._id} className="border rounded-md p-3">
								<div className="flex justify-between">
									<div>#{order.orderNumber}</div>
									<div className="font-medium">৳{showReadAbleCurrency(order.totalAmount)}</div>
								</div>
								<div className="text-muted-foreground">Items: {order.items?.length || 0}</div>
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
						{historyPurchases.map((purchase) => (
							<div key={purchase._id} className="border rounded-md p-3">
								<div className="flex justify-between">
									<div>#{purchase.purchaseNumber}</div>
									<div className="font-medium">৳{showReadAbleCurrency(purchase.totalAmount)}</div>
								</div>
								<div className="text-muted-foreground">Items: {purchase.items?.length || 0}</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
