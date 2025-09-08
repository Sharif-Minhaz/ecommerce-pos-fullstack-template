import { getMyOrders } from "@/app/actions/sales";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default async function MyOrdersPage() {
	const result = await getMyOrders();
	if (!result.success) {
		return <div className="container mx-auto py-8 px-2 max-w-7xl">Failed to load orders</div>;
	}
	type PopulatedItem = { _id: string; quantity: number; product?: { title: string; gallery?: string[] } };
	type PopulatedOrder = {
		_id: string;
		orderNumber: string;
		status: string;
		totalAmount: number;
		createdAt: string;
		items: PopulatedItem[];
	};
	const orders = result.orders as PopulatedOrder[];
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<h1 className="text-2xl font-bold mb-6">My Orders</h1>
			<div className="space-y-4">
				{orders.map((o) => (
					<Card key={String(o._id)}>
						<CardContent className="py-6 space-y-3">
							<div className="flex items-center justify-between">
								<CardTitle>{o.orderNumber}</CardTitle>
								<div className="text-xs text-muted-foreground">
									{new Date(o.createdAt).toLocaleString()}
								</div>
							</div>
							<div className="text-sm text-muted-foreground">Status: {o.status}</div>
							<div className="divide-y">
								{o.items.map((it) => (
									<div key={String(it._id)} className="flex items-center gap-3 py-3">
										<div className="relative w-12 h-12 flex-shrink-0">
											{it.product?.gallery?.[0] ? (
												<Image
													src={it.product.gallery[0]}
													alt={it.product.title}
													fill
													sizes="48px"
													className="object-contain rounded border"
												/>
											) : (
												<div className="w-12 h-12 rounded border bg-muted" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium truncate">
												{it.product?.title || "Untitled"}
											</div>
											<div className="text-xs text-muted-foreground">Qty: {it.quantity}</div>
										</div>
									</div>
								))}
							</div>
							<div className="text-sm">Total: ৳ {o.totalAmount}</div>
						</CardContent>
					</Card>
				))}
				{orders.length === 0 && <div>No orders yet.</div>}
			</div>
		</div>
	);
}
