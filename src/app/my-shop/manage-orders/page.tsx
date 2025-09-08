import { getVendorOrders, updateOrderStatus } from "@/app/actions/sales";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function ManageOrdersPage() {
	const result = await getVendorOrders();
	if (!result.success) {
		return <div className="container mx-auto py-8 px-2 max-w-7xl">Failed to load orders</div>;
	}
	const orders = result.orders as any[];
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
			<div className="space-y-4">
				{orders.map((o) => (
					<Card key={String(o._id)}>
						<CardContent className="py-6 space-y-3">
							<CardTitle>{o.orderNumber}</CardTitle>
							<div className="text-sm">Customer: {o.deliveryDetails?.name || ""}</div>
							<div className="text-sm">Status: {o.status}</div>
							<form action={updateOrderStatus} className="flex items-center gap-2">
								<input type="hidden" name="orderId" value={String(o._id)} />
								<select name="status" className="border rounded px-2 py-1 text-sm">
									{["pending", "approved", "processing", "shipped", "delivered", "cancelled"].map(
										(s) => (
											<option key={s} value={s} selected={s === o.status}>
												{s}
											</option>
										)
									)}
								</select>
								<button className="border rounded px-3 py-1 text-sm" type="submit">
									Update
								</button>
							</form>
						</CardContent>
					</Card>
				))}
				{orders.length === 0 && <div>No orders yet.</div>}
			</div>
		</div>
	);
}
