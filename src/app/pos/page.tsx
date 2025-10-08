"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getVendorPurchases } from "@/app/actions/purchase";
import { getVendorProducts } from "@/app/actions/product";
import { getVendorDeliveredSales } from "@/app/actions/sales";
import DashboardOverview from "@/components/pos/DashboardOverview";
import { PurchaseLite, SalesOrderLite } from "@/types/sales";
import SalesForm from "@/components/pos/SalesForm";
import PurchaseForm from "@/components/pos/PurchaseForm";
import History from "@/components/pos/History";

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

	const [products, setProducts] = useState<VendorProductLite[]>([]);

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

	// purchase totals

	if (status === "loading") return null;
	if (!session || session.user?.userType !== "vendor") return null;

	return (
		<div className="container mx-auto py-6 px-2 max-w-6xl">
			<Tabs defaultValue="dashboard">
				<TabsList>
					<TabsTrigger value="dashboard">Dashboard</TabsTrigger>
					<TabsTrigger value="sales">Sales</TabsTrigger>
					<TabsTrigger value="purchase">Purchase</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>

				<TabsContent value="dashboard">
					<DashboardOverview
						historySales={historySales}
						historyPurchases={historyPurchases}
						products={products}
					/>
				</TabsContent>

				<TabsContent value="sales">
					<SalesForm products={products} setHistorySales={setHistorySales} />
				</TabsContent>

				<TabsContent value="purchase">
					<PurchaseForm products={products} setHistoryPurchases={setHistoryPurchases} />
				</TabsContent>

				<TabsContent value="history">
					<History historySales={historySales} historyPurchases={historyPurchases} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
