"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User, Mail, Hash, Calendar, Edit3, Save, X, Store } from "lucide-react";
import Link from "next/link";
import { getRiderProfile } from "@/app/actions/rider";

interface UserProfile {
	_id: string;
	name: string;
	email: string;
	phoneNumber: string;
	userType: "user" | "vendor" | "admin";
	image?: string;
	createdAt: string;
	updatedAt: string;
}

export default function ProfilePage() {
	const { status } = useSession();
	const router = useRouter();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		phoneNumber: "",
	});
	const [riderLoading, setRiderLoading] = useState(false);
	const [hasRiderProfile, setHasRiderProfile] = useState<boolean | null>(null);

	// =============== fetch user profile on component mount ================
	useEffect(() => {
		if (status === "loading") return;

		if (status === "unauthenticated") {
			router.push("/auth/login");
			return;
		}

		fetchProfile();
	}, [status, router]);

	const fetchProfile = async () => {
		try {
			setLoading(true);
			const result = await getUserProfile();

			if (result.success && result.user) {
				setProfile(result.user);
				setFormData({
					name: result.user.name || "",
					phoneNumber: result.user.phoneNumber || "",
				});
				// check rider profile existence when user is rider
				if (result.user.userType === "rider") {
					setRiderLoading(true);
					try {
						const r = await getRiderProfile();
						setHasRiderProfile(!!r.success);
					} catch {
						setHasRiderProfile(false);
					} finally {
						setRiderLoading(false);
					}
				} else {
					setHasRiderProfile(null);
				}
			} else {
				toast.error(result.error || "Failed to fetch profile");
			}
		} catch {
			toast.error("An error occurred while fetching profile");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setUpdating(true);
			const formDataObj = new FormData();

			Object.entries(formData).forEach(([key, value]) => {
				formDataObj.append(key, value);
			});

			const result = await updateUserProfile(formDataObj);

			if (result.success && result.user) {
				setProfile(result.user);
				setIsEditing(false);
				toast.success("Profile updated successfully!");
			} else {
				toast.error(result.error || "Failed to update profile");
			}
		} catch {
			toast.error("An error occurred while updating profile");
		} finally {
			setUpdating(false);
		}
	};

	const handleCancel = () => {
		if (profile) {
			setFormData({
				name: profile.name || "",
				phoneNumber: profile.phoneNumber || "",
			});
		}
		setIsEditing(false);
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Profile not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Profile</h1>
				<p className="text-muted-foreground">Manage your account settings and preferences</p>
			</div>

			<div className="grid gap-6">
				{/* Profile Header */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
								{profile.image ? (
									<img
										src={profile.image}
										alt={profile.name}
										className="w-16 h-16 rounded-full object-cover"
									/>
								) : (
									<User className="h-8 w-8 text-primary" />
								)}
							</div>
							<div>
								<CardTitle className="text-2xl">{profile.name}</CardTitle>
								<CardDescription className="flex items-center space-x-2">
									<Mail className="h-4 w-4" />
									<span>{profile.email}</span>
								</CardDescription>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							{!isEditing ? (
								<Button onClick={() => setIsEditing(true)} variant="outline">
									<Edit3 className="h-4 w-4 mr-2" />
									Edit Profile
								</Button>
							) : (
								<div className="flex space-x-2">
									<Button onClick={handleCancel} variant="outline">
										<X className="h-4 w-4 mr-2" />
										Cancel
									</Button>
									<Button onClick={handleSubmit} disabled={updating}>
										{updating ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Save className="h-4 w-4 mr-2" />
										)}
										Save Changes
									</Button>
								</div>
							)}
						</div>
					</CardHeader>
				</Card>

				{/* Vendor Shop Link */}
				{profile.userType === "vendor" && (
					<Card className="border-primary/20 bg-primary/5">
						<CardContent>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Store className="h-6 w-6 text-primary" />
									<div>
										<h3 className="font-semibold">Manage Your Shop</h3>
										<p className="text-sm text-muted-foreground">
											Update shop information, upload images, and manage your business
										</p>
									</div>
								</div>
								<Link href="/my-shop">
									<Button>
										<Store className="h-4 w-4 mr-2" />
										Go to My Shop
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Rider Profile Management */}
				{profile.userType === "rider" && (
					<Card className="border-primary/20 bg-primary/5">
						<CardContent>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold">Rider Profile</h3>
									<p className="text-sm text-muted-foreground">
										Manage your rider details, vehicle information, and delivery access
									</p>
								</div>
								<div className="flex gap-2">
									{hasRiderProfile ? (
										<>
											<Link href="/rider/dashboard">
												<Button variant="secondary" disabled={riderLoading}>
													Rider Dashboard
												</Button>
											</Link>
											<Link href="/auth/register-rider">
												<Button disabled={riderLoading}>Manage Rider Profile</Button>
											</Link>
										</>
									) : (
										<Link href="/auth/register-rider">
											<Button disabled={riderLoading}>Create Rider Profile</Button>
										</Link>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Profile Form */}
				<form onSubmit={handleSubmit}>
					<div className="grid gap-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<User className="h-5 w-5" />
									<span>Basic Information</span>
								</CardTitle>
								<CardDescription>Your personal details and contact information</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) => handleInputChange("name", e.target.value)}
											disabled={!isEditing}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phoneNumber">Phone Number</Label>
										<Input
											id="phoneNumber"
											value={formData.phoneNumber}
											onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
											disabled={!isEditing}
											placeholder="+1234567890"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input id="email" value={profile.email} disabled className="bg-muted" />
									<p className="text-sm text-muted-foreground">Email cannot be changed</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="userType">Account Type</Label>
									<Input
										id="userType"
										value={profile.userType.charAt(0).toUpperCase() + profile.userType.slice(1)}
										disabled
										className="bg-muted"
									/>
									<p className="text-sm text-muted-foreground">Account type cannot be changed</p>
								</div>
							</CardContent>
						</Card>

						{/* Account Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Hash className="h-5 w-5" />
									<span>Account Information</span>
								</CardTitle>
								<CardDescription>Account creation and last update details</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Account Created</Label>
										<div className="flex items-center space-x-2 text-sm text-muted-foreground">
											<Calendar className="h-4 w-4" />
											<span>{new Date(profile.createdAt).toLocaleDateString()}</span>
										</div>
									</div>
									<div className="space-y-2">
										<Label>Last Updated</Label>
										<div className="flex items-center space-x-2 text-sm text-muted-foreground">
											<Calendar className="h-4 w-4" />
											<span>{new Date(profile.updatedAt).toLocaleDateString()}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</form>
			</div>
		</div>
	);
}
