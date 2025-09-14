"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Search, Filter, Tag, TrendingUp, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { createCoupon, getVendorCoupons, updateCoupon, deleteCoupon, toggleCouponStatus } from "@/app/actions/coupon";
import { ICoupon } from "@/types/coupon";
import CouponForm from "@/components/coupons/CouponForm";
import CouponCard from "@/components/coupons/CouponCard";
import FloatingActionButton from "@/components/shared/FloatingActionButton";

export default function VendorCouponsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [coupons, setCoupons] = useState<ICoupon[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
	const [deletingCoupon, setDeletingCoupon] = useState<string | null>(null);
	const [togglingCoupon, setTogglingCoupon] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "expired">("all");

	// =============== check authentication and vendor status ================
	useEffect(() => {
		if (status === "loading") return;

		if (status === "unauthenticated") {
			router.push("/auth/login");
			return;
		}

		if (session?.user?.userType !== "vendor") {
			router.push("/profile");
			return;
		}

		fetchCoupons();
	}, [status, session, router]);

	// =============== fetch vendor coupons ================
	const fetchCoupons = async () => {
		try {
			setLoading(true);
			const result = await getVendorCoupons();

			if (result.success && result.coupons) {
				setCoupons(result.coupons);
			} else {
				toast.error(result.error || "Failed to fetch coupons");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while fetching coupons");
		} finally {
			setLoading(false);
		}
	};

	// =============== handle create coupon ================
	const handleCreateCoupon = async (formData: FormData) => {
		try {
			const result = await createCoupon(formData);

			if (result.success) {
				toast.success("Coupon created successfully");
				setShowForm(false);
				fetchCoupons();
			} else {
				toast.error(result.error || "Failed to create coupon");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while creating coupon");
		}
	};

	// =============== handle update coupon ================
	const handleUpdateCoupon = async (formData: FormData) => {
		if (!editingCoupon) return;

		try {
			const result = await updateCoupon(editingCoupon._id, formData);

			if (result.success) {
				toast.success("Coupon updated successfully");
				setEditingCoupon(null);
				fetchCoupons();
			} else {
				toast.error(result.error || "Failed to update coupon");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while updating coupon");
		}
	};

	// =============== handle delete coupon ================
	const handleDeleteCoupon = async (couponId: string) => {
		try {
			setDeletingCoupon(couponId);
			const result = await deleteCoupon(couponId);

			if (result.success) {
				toast.success("Coupon deleted successfully");
				fetchCoupons();
			} else {
				toast.error(result.error || "Failed to delete coupon");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while deleting coupon");
		} finally {
			setDeletingCoupon(null);
		}
	};

	// =============== handle toggle coupon status ================
	const handleToggleStatus = async (couponId: string) => {
		try {
			setTogglingCoupon(couponId);
			const result = await toggleCouponStatus(couponId);

			if (result.success) {
				toast.success("Coupon status updated successfully");
				fetchCoupons();
			} else {
				toast.error(result.error || "Failed to update coupon status");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while updating coupon status");
		} finally {
			setTogglingCoupon(null);
		}
	};

	// =============== handle edit coupon ================
	const handleEditCoupon = (coupon: ICoupon) => {
		setEditingCoupon(coupon);
		setShowForm(true);
	};

	// =============== handle cancel form ================
	const handleCancelForm = () => {
		setShowForm(false);
		setEditingCoupon(null);
	};

	// =============== filter and search coupons ================
	const filteredCoupons = coupons.filter((coupon) => {
		const matchesSearch =
			coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			coupon.description.toLowerCase().includes(searchTerm.toLowerCase());

		const isExpired = new Date(coupon.validTill) < new Date();
		const isActive = coupon.isActive && !isExpired;

		let matchesFilter = true;
		switch (filterStatus) {
			case "active":
				matchesFilter = isActive;
				break;
			case "inactive":
				matchesFilter = !coupon.isActive && !isExpired;
				break;
			case "expired":
				matchesFilter = isExpired;
				break;
			default:
				matchesFilter = true;
		}

		return matchesSearch && matchesFilter;
	});

	// =============== get statistics ================
	const stats = {
		total: coupons.length,
		active: coupons.filter((c) => c.isActive && new Date(c.validTill) > new Date()).length,
		inactive: coupons.filter((c) => !c.isActive && new Date(c.validTill) > new Date()).length,
		expired: coupons.filter((c) => new Date(c.validTill) < new Date()).length,
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* =============== header ================ */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<Tag className="w-8 h-8" />
							Coupon Management
						</h1>
						<p className="text-muted-foreground">Create and manage discount coupons for your customers</p>
					</div>
					<Button onClick={() => setShowForm(true)} className="hidden md:flex">
						<Plus className="w-4 h-4 mr-2" />
						Create Coupon
					</Button>
				</div>

				{/* =============== statistics cards ================ */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Tag className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-2xl font-bold">{stats.total}</p>
									<p className="text-sm text-muted-foreground">Total</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="w-4 h-4 text-green-500" />
								<div>
									<p className="text-2xl font-bold text-green-600">{stats.active}</p>
									<p className="text-sm text-muted-foreground">Active</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<AlertCircle className="w-4 h-4 text-yellow-500" />
								<div>
									<p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
									<p className="text-sm text-muted-foreground">Inactive</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-red-500" />
								<div>
									<p className="text-2xl font-bold text-red-600">{stats.expired}</p>
									<p className="text-sm text-muted-foreground">Expired</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* =============== search and filter ================ */}
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1">
						<Label htmlFor="search" className="sr-only">
							Search coupons
						</Label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								id="search"
								placeholder="Search coupons by name, code, or description..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value as any)}
							className="px-3 py-2 border border-input bg-background rounded-md text-sm"
						>
							<option value="all">All Coupons</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="expired">Expired</option>
						</select>
					</div>
				</div>
			</div>

			{/* =============== coupon form ================ */}
			{showForm && (
				<div className="mb-8">
					<CouponForm
						coupon={editingCoupon}
						onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
						onCancel={handleCancelForm}
						isLoading={false}
					/>
				</div>
			)}

			{/* =============== coupons list ================ */}
			{coupons.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Tag className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No coupons found</h3>
						<p className="text-muted-foreground text-center mb-4">
							Create your first discount coupon to start attracting customers
						</p>
						<Button onClick={() => setShowForm(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Create Your First Coupon
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredCoupons.map((coupon) => (
						<CouponCard
							key={coupon._id}
							coupon={coupon}
							onEdit={handleEditCoupon}
							onDelete={handleDeleteCoupon}
							onToggleStatus={handleToggleStatus}
							isDeleting={deletingCoupon === coupon._id}
							isToggling={togglingCoupon === coupon._id}
						/>
					))}
				</div>
			)}

			{/* =============== floating action button ================ */}
			<FloatingActionButton
				onClick={() => setShowForm(true)}
				icon={<Plus className="w-6 h-6" />}
				label="Create Coupon"
			/>
		</div>
	);
}
