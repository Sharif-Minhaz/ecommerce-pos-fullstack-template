import {
	getRiderProfile,
	getRiderAssignedOrders,
	getRiderDeliveryHistory,
	updateRiderStatusForm,
} from "@/app/actions/rider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import Link from "next/link";

export default async function RiderDashboardPage() {
	const [profileResult, assignedOrdersResult, historyResult] = await Promise.all([
		getRiderProfile(),
		getRiderAssignedOrders(),
		getRiderDeliveryHistory(),
	]);

	if (!profileResult.success) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-7xl">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Rider Profile Not Found</h1>
					<p className="text-muted-foreground mb-4">
						You need to create a rider profile first to access the dashboard.
					</p>
					<Link href="/auth/register-rider">
						<Button>Create Rider Profile</Button>
					</Link>
				</div>
			</div>
		);
	}

	const profile = profileResult.rider;
	const assignedOrders = assignedOrdersResult.success ? assignedOrdersResult.orders : [];
	const deliveryHistory = historyResult.success ? historyResult.orders : [];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "assigned":
				return "bg-yellow-100 text-yellow-800";
			case "accepted":
				return "bg-blue-100 text-blue-800";
			case "picked_up":
				return "bg-purple-100 text-purple-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "rejected":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Rider Dashboard</h1>
				<p className="text-muted-foreground">Welcome back, {profile.user.name}!</p>
			</div>

			{/* =============== rider stats overview ================ */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold capitalize">{profile.status}</div>
						<p className="text-xs text-muted-foreground">{profile.isActive ? "Active" : "Inactive"}</p>
						<form
							action={async (formData) => {
								"use server";
								await updateRiderStatusForm(formData);
							}}
							className="mt-3 flex items-center gap-2"
						>
							<input type="hidden" name="noop" value="1" />
							<select name="status" className="border rounded px-2 py-1 text-sm">
								<option value="available" selected={profile.status === "available"}>
									available
								</option>
								<option value="busy" selected={profile.status === "busy"}>
									busy
								</option>
								<option value="offline" selected={profile.status === "offline"}>
									offline
								</option>
							</select>
							<button className="border rounded px-3 py-1 text-sm" type="submit">
								Update
							</button>
						</form>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Deliveries</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{profile.totalDeliveries}</div>
						<p className="text-xs text-muted-foreground">{profile.successfulDeliveries} successful</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{profile.totalDeliveries > 0
								? Math.round((profile.successfulDeliveries / profile.totalDeliveries) * 100)
								: 0}
							%
						</div>
						<p className="text-xs text-muted-foreground">{profile.failedDeliveries} failed</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{profile.rating.toFixed(1)}</div>
						<p className="text-xs text-muted-foreground">out of 5.0</p>
					</CardContent>
				</Card>
			</div>

			{/* =============== vehicle information ================ */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Vehicle Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Vehicle Type</p>
							<p className="capitalize">{profile.vehicleInfo.vehicleType}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Brand & Model</p>
							<p>
								{profile.vehicleInfo.brand} {profile.vehicleInfo.model}
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Year</p>
							<p>{profile.vehicleInfo.year}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Color</p>
							<p className="capitalize">{profile.vehicleInfo.color}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">License Plate</p>
							<p>{profile.vehicleInfo.licensePlate}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Service Areas</p>
							<p>{profile.serviceAreas.join(", ")}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* =============== orders and history tabs ================ */}
			<Tabs defaultValue="assigned" className="space-y-6">
				<TabsList>
					<TabsTrigger value="assigned">Assigned Orders ({assignedOrders.length})</TabsTrigger>
					<TabsTrigger value="history">Delivery History ({deliveryHistory.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="assigned" className="space-y-4">
					{assignedOrders.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<p className="text-muted-foreground">No assigned orders at the moment.</p>
							</CardContent>
						</Card>
					) : (
						<Accordion type="single" collapsible className="space-y-2">
							{assignedOrders.map((order: any) => (
								<AccordionItem key={String(order._id)} value={String(order._id)}>
									<AccordionTrigger className="hover:no-underline">
										<div className="flex items-center justify-between w-full pr-4">
											<div className="text-left">
												<div className="font-semibold">{order.orderNumber}</div>
												<div className="text-sm text-muted-foreground">
													{order.user?.name || "Unknown Customer"} • ৳{order.totalAmount}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge className={getStatusColor(order.deliveryStatus)}>
													{order.deliveryStatus.replace("_", " ")}
												</Badge>
												<div className="text-xs text-muted-foreground">
													{new Date(order.riderAssignmentDate).toLocaleString()}
												</div>
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<Card>
											<CardContent className="py-6 space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<h4 className="font-medium mb-2">Customer Information</h4>
														<p className="text-sm">Name: {order.user?.name || "N/A"}</p>
														<p className="text-sm">
															Phone: {order.user?.phoneNumber || "N/A"}
														</p>
													</div>
													<div>
														<h4 className="font-medium mb-2">Delivery Information</h4>
														<p className="text-sm">
															Address: {order.deliveryDetails?.address}
														</p>
														<p className="text-sm">City: {order.deliveryDetails?.city}</p>
													</div>
												</div>

												<div>
													<h4 className="font-medium mb-2">Order Items</h4>
													<div className="space-y-2">
														{order.items.map((item: any) => (
															<div
																key={String(item._id)}
																className="flex items-center gap-3"
															>
																<div className="relative w-12 h-12 flex-shrink-0">
																	{item.product?.gallery?.[0] ? (
																		<Image
																			src={item.product.gallery[0]}
																			alt={item.product.title}
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
																		{item.product?.title || "Untitled"}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		Qty: {item.quantity} • ৳{item.totalPrice}
																	</div>
																</div>
															</div>
														))}
													</div>
												</div>

												<div className="flex gap-2">
													{order.deliveryStatus === "assigned" && (
														<>
															<Link href={`/rider/accept-order/${order._id}`}>
																<Button
																	size="sm"
																	className="bg-green-600 hover:bg-green-700"
																>
																	Accept Order
																</Button>
															</Link>
															<Link href={`/rider/reject-order/${order._id}`}>
																<Button size="sm" variant="destructive">
																	Reject Order
																</Button>
															</Link>
														</>
													)}
													{order.deliveryStatus === "accepted" && (
														<Link href={`/rider/update-delivery/${order._id}`}>
															<Button size="sm">Update Status</Button>
														</Link>
													)}
												</div>
											</CardContent>
										</Card>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}
				</TabsContent>

				<TabsContent value="history" className="space-y-4">
					{deliveryHistory.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<p className="text-muted-foreground">No delivery history yet.</p>
							</CardContent>
						</Card>
					) : (
						<Accordion type="single" collapsible className="space-y-2">
							{deliveryHistory.map((order: any) => (
								<AccordionItem key={String(order._id)} value={String(order._id)}>
									<AccordionTrigger className="hover:no-underline">
										<div className="flex items-center justify-between w-full pr-4">
											<div className="text-left">
												<div className="font-semibold">{order.orderNumber}</div>
												<div className="text-sm text-muted-foreground">
													{order.user?.name || "Unknown Customer"} • ৳{order.totalAmount}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge className={getStatusColor(order.deliveryStatus)}>
													{order.deliveryStatus.replace("_", " ")}
												</Badge>
												<div className="text-xs text-muted-foreground">
													{new Date(order.riderAssignmentDate).toLocaleString()}
												</div>
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<Card>
											<CardContent className="py-6 space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<h4 className="font-medium mb-2">Customer Information</h4>
														<p className="text-sm">Name: {order.user?.name || "N/A"}</p>
														<p className="text-sm">
															Phone: {order.user?.phoneNumber || "N/A"}
														</p>
													</div>
													<div>
														<h4 className="font-medium mb-2">Delivery Information</h4>
														<p className="text-sm">
															Address: {order.deliveryDetails?.address}
														</p>
														<p className="text-sm">City: {order.deliveryDetails?.city}</p>
													</div>
												</div>

												{order.deliveryNotes && (
													<div>
														<h4 className="font-medium mb-2">Delivery Notes</h4>
														<p className="text-sm">{order.deliveryNotes}</p>
													</div>
												)}

												{order.riderRejectionReason && (
													<div>
														<h4 className="font-medium mb-2">Rejection Reason</h4>
														<p className="text-sm text-red-600">
															{order.riderRejectionReason}
														</p>
													</div>
												)}
											</CardContent>
										</Card>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
