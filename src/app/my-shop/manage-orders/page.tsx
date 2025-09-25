import { getVendorOrders, updateOrderStatus } from "@/app/actions/sales";
import { getAvailableRiders, assignRiderToOrderForm } from "@/app/actions/rider";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default async function ManageOrdersPage() {
	const [ordersResult, ridersResult] = await Promise.all([getVendorOrders(), getAvailableRiders()]);

	if (!ordersResult.success) {
		return <div className="container mx-auto py-8 px-2 max-w-7xl">Failed to load orders</div>;
	}

	// lightweight rider type for ui mapping
	type RiderLite = {
		_id: string;
		user?: { name?: string; phoneNumber?: string };
		vehicleInfo?: { vehicleType?: string; brand?: string; model?: string };
		rating?: number;
		status?: string;
		serviceAreas: string[];
	};

	const riders: RiderLite[] = ridersResult.success ? (ridersResult.riders as RiderLite[]) : [];
	type PopulatedItem = { _id: string; quantity: number; product?: { title: string; gallery?: any[] } };
	type PopulatedOrder = {
		_id: string;
		orderNumber: string;
		status: string;
		totalAmount: number;
		createdAt: string;
		deliveryDetails?: { name?: string; city?: string };
		deliveryStatus?: string;
		assignedRider?: RiderLite;
		items: PopulatedItem[];
	};
	const orders = ordersResult.orders as PopulatedOrder[];
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
			{orders.length === 0 ? (
				<div>No orders yet.</div>
			) : (
				<Accordion type="single" collapsible className="space-y-2">
					{orders.map((o) => (
						<AccordionItem key={String(o._id)} value={String(o._id)}>
							<AccordionTrigger className="hover:no-underline">
								<div className="flex items-center justify-between w-full pr-4">
									<div className="text-left">
										<div className="font-semibold">{o.orderNumber}</div>
										<div className="text-sm text-muted-foreground">
											{o.deliveryDetails?.name || "Unknown Customer"} • {o.status} • ৳
											{o.totalAmount}
										</div>
										{o.deliveryStatus && (
											<div className="flex items-center gap-2 mt-1">
												<Badge variant="outline" className="text-xs">
													Delivery: {o.deliveryStatus.replace("_", " ")}
												</Badge>
												{o.assignedRider && (
													<Badge variant="secondary" className="text-xs">
														Rider Assigned
													</Badge>
												)}
											</div>
										)}
									</div>
									<div className="text-xs text-muted-foreground">
										{new Date(o.createdAt).toLocaleString()}
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<Card>
									<CardContent className="py-6 space-y-3">
										<div className="text-sm">Customer: {o.deliveryDetails?.name || ""}</div>
										<div className="text-sm">Status: {o.status}</div>
										<div className="divide-y">
											{o.items.map((it) => (
												<div key={String(it._id)} className="flex items-center gap-3 py-3">
													<div className="relative w-12 h-12 flex-shrink-0">
														{it.product?.gallery?.[0] ? (
															<Image
																src={
																	(it.product.gallery[0] as any)?.url ||
																	(it.product.gallery[0] as any)
																}
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
														<div className="text-xs text-muted-foreground">
															Qty: {it.quantity}
														</div>
													</div>
												</div>
											))}
										</div>
										<div className="text-sm">Total: ৳ {o.totalAmount}</div>

										{/* =============== rider assignment section ================ */}
										{o.deliveryStatus === "pending_assignment" && riders.length > 0 && (
											<div className="border-t pt-4">
												<h4 className="font-medium mb-2">Assign Rider</h4>
												<form
													action={async (formData) => {
														await assignRiderToOrderForm(formData);
													}}
													className="flex items-center gap-2"
												>
													<input type="hidden" name="orderId" value={String(o._id)} />
													<select
														name="riderId"
														className="border rounded px-2 py-1 text-sm flex-1"
														required
													>
														<option value="">Select a rider</option>
														{riders
															.filter((rider: RiderLite) =>
																rider.serviceAreas.includes(
																	(o.deliveryDetails?.city || "").toLowerCase()
																)
															)
															.map((rider: RiderLite) => (
																<option key={rider._id} value={rider._id}>
																	{rider.user?.name} -{" "}
																	{rider.vehicleInfo?.vehicleType} ({rider.rating}⭐)
																</option>
															))}
													</select>
													<button
														className="border rounded px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700"
														type="submit"
													>
														Assign
													</button>
												</form>
												{riders.filter((rider: RiderLite) =>
													rider.serviceAreas.includes(
														(o.deliveryDetails?.city || "").toLowerCase()
													)
												).length === 0 && (
													<p className="text-sm text-muted-foreground mt-1">
														No riders available for {o.deliveryDetails?.city}
													</p>
												)}
											</div>
										)}

										{o.assignedRider && (
											<div className="border-t pt-4">
												<h4 className="font-medium mb-2">Assigned Rider</h4>
												<div className="text-sm text-muted-foreground">
													{/* =============== rider quick summary ================ */}
													<span className="font-medium text-foreground">
														{o.assignedRider?.user?.name || "Unknown Rider"}
													</span>
													{typeof o.assignedRider?.rating === "number" && (
														<span className="ml-2">({o.assignedRider.rating}⭐)</span>
													)}
												</div>
												<div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
													<div>
														<span className="text-muted-foreground">Phone: </span>
														<span>{o.assignedRider?.user?.phoneNumber || "N/A"}</span>
													</div>
													<div>
														<span className="text-muted-foreground">Vehicle: </span>
														<span>
															{o.assignedRider?.vehicleInfo?.vehicleType || "N/A"}
															{o.assignedRider?.vehicleInfo?.brand
																? ` • ${o.assignedRider.vehicleInfo.brand}`
																: ""}
															{o.assignedRider?.vehicleInfo?.model
																? ` ${o.assignedRider.vehicleInfo.model}`
																: ""}
														</span>
													</div>
													<div>
														<span className="text-muted-foreground">Status: </span>
														<Badge variant="outline">
															{o.assignedRider?.status || "unknown"}
														</Badge>
													</div>
												</div>
												<div className="text-sm mt-4">
													Current Delivery Status:{" "}
													<Badge variant="outline" className="bg-blue-100 text-blue-800">
														{o.deliveryStatus}
													</Badge>
												</div>
											</div>
										)}

										{/* =============== order status update section ================ */}
										<div className="border-t pt-4">
											<h4 className="font-medium mb-2">Update Order Status</h4>
											<form action={updateOrderStatus} className="flex items-center gap-2">
												<input type="hidden" name="orderId" value={String(o._id)} />
												<select name="status" className="border rounded px-2 py-1 text-sm">
													{[
														"pending",
														"approved",
														"processing",
														"assigned",
														"accepted",
														"picked_up",
														"failed",
														"shipped",
														"delivered",
														"cancelled",
													].map((s) => (
														<option key={s} value={s} selected={s === o.status}>
															{s}
														</option>
													))}
												</select>
												<button className="border rounded px-3 py-1 text-sm" type="submit">
													Update
												</button>
											</form>
										</div>
									</CardContent>
								</Card>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</div>
	);
}
