"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRiderProfile, getRiderProfile, updateRiderProfile } from "@/app/actions/rider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RegisterRiderPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [formData, setFormData] = useState({
		// =============== vehicle information ================
		vehicleType: "",
		brand: "",
		model: "",
		year: "",
		color: "",
		licensePlate: "",
		engineNumber: "",
		chassisNumber: "",
		registrationNumber: "",
		insuranceNumber: "",
		insuranceExpiry: "",
		drivingLicenseNumber: "",
		drivingLicenseExpiry: "",
		vehicleImage: "",
		licenseImage: "",
		insuranceImage: "",
		// =============== bank account information ================
		accountNumber: "",
		bankName: "",
		accountHolderName: "",
		branchName: "",
		// =============== emergency contact ================
		emergencyName: "",
		emergencyPhone: "",
		emergencyRelationship: "",
		// =============== service areas and working hours ================
		serviceAreas: "",
		workingStart: "",
		workingEnd: "",
		workingDays: [] as string[],
	});

	// =============== prefill form if rider profile exists ================
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const res = await getRiderProfile();
				if (!res.success || !res.rider) return;
				if (!isMounted) return;
				const r = res.rider as {
					vehicleInfo?: {
						vehicleType?: string;
						brand?: string;
						model?: string;
						year?: number;
						color?: string;
						licensePlate?: string;
						engineNumber?: string;
						chassisNumber?: string;
						registrationNumber?: string;
						insuranceNumber?: string;
						insuranceExpiry?: string | Date;
						drivingLicenseNumber?: string;
						drivingLicenseExpiry?: string | Date;
						vehicleImage?: string;
						licenseImage?: string;
						insuranceImage?: string;
					};
					bankAccount?: {
						accountNumber?: string;
						bankName?: string;
						accountHolderName?: string;
						branchName?: string;
					};
					emergencyContact?: { name?: string; phone?: string; relationship?: string };
					serviceAreas?: string[];
					workingHours?: { start?: string; end?: string; days?: string[] };
				};
				setIsUpdate(true);
				setFormData({
					vehicleType: r.vehicleInfo?.vehicleType || "",
					brand: r.vehicleInfo?.brand || "",
					model: r.vehicleInfo?.model || "",
					year: String(r.vehicleInfo?.year || ""),
					color: r.vehicleInfo?.color || "",
					licensePlate: r.vehicleInfo?.licensePlate || "",
					engineNumber: r.vehicleInfo?.engineNumber || "",
					chassisNumber: r.vehicleInfo?.chassisNumber || "",
					registrationNumber: r.vehicleInfo?.registrationNumber || "",
					insuranceNumber: r.vehicleInfo?.insuranceNumber || "",
					insuranceExpiry: r.vehicleInfo?.insuranceExpiry
						? new Date(r.vehicleInfo.insuranceExpiry).toISOString().slice(0, 10)
						: "",
					drivingLicenseNumber: r.vehicleInfo?.drivingLicenseNumber || "",
					drivingLicenseExpiry: r.vehicleInfo?.drivingLicenseExpiry
						? new Date(r.vehicleInfo.drivingLicenseExpiry).toISOString().slice(0, 10)
						: "",
					vehicleImage: r.vehicleInfo?.vehicleImage || "",
					licenseImage: r.vehicleInfo?.licenseImage || "",
					insuranceImage: r.vehicleInfo?.insuranceImage || "",
					accountNumber: r.bankAccount?.accountNumber || "",
					bankName: r.bankAccount?.bankName || "",
					accountHolderName: r.bankAccount?.accountHolderName || "",
					branchName: r.bankAccount?.branchName || "",
					emergencyName: r.emergencyContact?.name || "",
					emergencyPhone: r.emergencyContact?.phone || "",
					emergencyRelationship: r.emergencyContact?.relationship || "",
					serviceAreas: Array.isArray(r.serviceAreas) ? r.serviceAreas.join(", ") : "",
					workingStart: r.workingHours?.start || "",
					workingEnd: r.workingHours?.end || "",
					workingDays: Array.isArray(r.workingHours?.days) ? r.workingHours.days : [],
				});
			} catch {
				// ignore: no rider profile yet
			}
		})();
		return () => {
			isMounted = false;
		};
	}, []);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleWorkingDaysChange = (day: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			workingDays: checked ? [...prev.workingDays, day] : prev.workingDays.filter((d) => d !== day),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const payload = {
				vehicleInfo: {
					vehicleType: formData.vehicleType as "bike" | "car" | "motorcycle" | "scooter",
					brand: formData.brand,
					model: formData.model,
					year: parseInt(formData.year),
					color: formData.color,
					licensePlate: formData.licensePlate,
					engineNumber: formData.engineNumber || undefined,
					chassisNumber: formData.chassisNumber || undefined,
					registrationNumber: formData.registrationNumber,
					insuranceNumber: formData.insuranceNumber || undefined,
					insuranceExpiry: formData.insuranceExpiry ? new Date(formData.insuranceExpiry) : undefined,
					drivingLicenseNumber: formData.drivingLicenseNumber,
					drivingLicenseExpiry: new Date(formData.drivingLicenseExpiry),
					vehicleImage: formData.vehicleImage || undefined,
					licenseImage: formData.licenseImage || undefined,
					insuranceImage: formData.insuranceImage || undefined,
				},
				bankAccount: formData.accountNumber
					? {
							accountNumber: formData.accountNumber,
							bankName: formData.bankName,
							accountHolderName: formData.accountHolderName,
							branchName: formData.branchName || undefined,
					  }
					: undefined,
				emergencyContact: {
					name: formData.emergencyName,
					phone: formData.emergencyPhone,
					relationship: formData.emergencyRelationship,
				},
				serviceAreas: formData.serviceAreas
					.split(",")
					.map((area) => area.trim())
					.filter(Boolean),
				workingHours: {
					start: formData.workingStart,
					end: formData.workingEnd,
					days: formData.workingDays,
				},
			};

			const result = isUpdate
				? await updateRiderProfile(
						payload as unknown as {
							vehicleInfo?: {
								vehicleType: "bike" | "car" | "motorcycle" | "scooter";
								brand?: string;
								model?: string;
								year?: number;
								color?: string;
								licensePlate?: string;
								engineNumber?: string;
								chassisNumber?: string;
								registrationNumber?: string;
								insuranceNumber?: string;
								insuranceExpiry?: Date;
								drivingLicenseNumber?: string;
								drivingLicenseExpiry?: Date;
								vehicleImage?: string;
								licenseImage?: string;
								insuranceImage?: string;
							};
							bankAccount?: {
								accountNumber: string;
								bankName: string;
								accountHolderName: string;
								branchName?: string;
							} | null;
							emergencyContact?: { name?: string; phone?: string; relationship?: string };
							serviceAreas?: string[];
							workingHours?: { start?: string; end?: string; days?: string[] };
						}
				  )
				: await createRiderProfile(
						payload as {
							vehicleInfo: {
								vehicleType: "bike" | "car" | "motorcycle" | "scooter";
								brand: string;
								model: string;
								year: number;
								color: string;
								licensePlate: string;
								engineNumber?: string;
								chassisNumber?: string;
								registrationNumber: string;
								insuranceNumber?: string;
								insuranceExpiry?: Date;
								drivingLicenseNumber: string;
								drivingLicenseExpiry: Date;
								vehicleImage?: string;
								licenseImage?: string;
								insuranceImage?: string;
							};
							bankAccount?: {
								accountNumber: string;
								bankName: string;
								accountHolderName: string;
								branchName?: string;
							};
							emergencyContact: { name: string; phone: string; relationship: string };
							serviceAreas: string[];
							workingHours: { start: string; end: string; days: string[] };
						}
				  );

			if (result.success) {
				toast.success(isUpdate ? "Rider profile updated successfully!" : "Rider profile created successfully!");
				router.push("/rider/dashboard");
			} else {
				toast.error(
					result.error || (isUpdate ? "Failed to update rider profile" : "Failed to create rider profile")
				);
			}
		} catch {
			toast.error(
				isUpdate
					? "An error occurred while updating rider profile"
					: "An error occurred while creating rider profile"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			<Card>
				<CardHeader>
					<CardTitle>{isUpdate ? "Update Rider Profile" : "Register as a Rider"}</CardTitle>
					<p className="text-muted-foreground">
						{isUpdate
							? "Update your vehicle information and rider details"
							: "Fill in your vehicle information and details to start delivering orders"}
					</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* =============== vehicle information section ================ */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Vehicle Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="vehicleType">Vehicle Type *</Label>
									<Select
										value={formData.vehicleType}
										onValueChange={(value) => handleInputChange("vehicleType", value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select vehicle type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="bike">Bike</SelectItem>
											<SelectItem value="motorcycle">Motorcycle</SelectItem>
											<SelectItem value="scooter">Scooter</SelectItem>
											<SelectItem value="car">Car</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="brand">Brand *</Label>
									<Input
										id="brand"
										value={formData.brand}
										onChange={(e) => handleInputChange("brand", e.target.value)}
										placeholder="e.g., Honda, Yamaha, Toyota"
										required
									/>
								</div>
								<div>
									<Label htmlFor="model">Model *</Label>
									<Input
										id="model"
										value={formData.model}
										onChange={(e) => handleInputChange("model", e.target.value)}
										placeholder="e.g., CBR150R, Civic"
										required
									/>
								</div>
								<div>
									<Label htmlFor="year">Year *</Label>
									<Input
										id="year"
										type="number"
										value={formData.year}
										onChange={(e) => handleInputChange("year", e.target.value)}
										placeholder="2020"
										min="1990"
										max={new Date().getFullYear() + 1}
										required
									/>
								</div>
								<div>
									<Label htmlFor="color">Color *</Label>
									<Input
										id="color"
										value={formData.color}
										onChange={(e) => handleInputChange("color", e.target.value)}
										placeholder="e.g., Red, Blue, Black"
										required
									/>
								</div>
								<div>
									<Label htmlFor="licensePlate">License Plate *</Label>
									<Input
										id="licensePlate"
										value={formData.licensePlate}
										onChange={(e) =>
											handleInputChange("licensePlate", e.target.value.toUpperCase())
										}
										placeholder="e.g., DHA-1234"
										required
									/>
								</div>
								<div>
									<Label htmlFor="registrationNumber">Registration Number *</Label>
									<Input
										id="registrationNumber"
										value={formData.registrationNumber}
										onChange={(e) =>
											handleInputChange("registrationNumber", e.target.value.toUpperCase())
										}
										placeholder="Vehicle registration number"
										required
									/>
								</div>
								<div>
									<Label htmlFor="drivingLicenseNumber">Driving License Number *</Label>
									<Input
										id="drivingLicenseNumber"
										value={formData.drivingLicenseNumber}
										onChange={(e) =>
											handleInputChange("drivingLicenseNumber", e.target.value.toUpperCase())
										}
										placeholder="Driving license number"
										required
									/>
								</div>
								<div>
									<Label htmlFor="drivingLicenseExpiry">Driving License Expiry *</Label>
									<Input
										id="drivingLicenseExpiry"
										type="date"
										value={formData.drivingLicenseExpiry}
										onChange={(e) => handleInputChange("drivingLicenseExpiry", e.target.value)}
										required
									/>
								</div>
								<div>
									<Label htmlFor="engineNumber">Engine Number</Label>
									<Input
										id="engineNumber"
										value={formData.engineNumber}
										onChange={(e) => handleInputChange("engineNumber", e.target.value)}
										placeholder="Engine number (optional)"
									/>
								</div>
								<div>
									<Label htmlFor="chassisNumber">Chassis Number</Label>
									<Input
										id="chassisNumber"
										value={formData.chassisNumber}
										onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
										placeholder="Chassis number (optional)"
									/>
								</div>
								<div>
									<Label htmlFor="insuranceNumber">Insurance Number</Label>
									<Input
										id="insuranceNumber"
										value={formData.insuranceNumber}
										onChange={(e) => handleInputChange("insuranceNumber", e.target.value)}
										placeholder="Insurance number (optional)"
									/>
								</div>
								<div>
									<Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
									<Input
										id="insuranceExpiry"
										type="date"
										value={formData.insuranceExpiry}
										onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* =============== bank account information section ================ */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Bank Account Information (Optional)</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="accountNumber">Account Number</Label>
									<Input
										id="accountNumber"
										value={formData.accountNumber}
										onChange={(e) => handleInputChange("accountNumber", e.target.value)}
										placeholder="Bank account number"
									/>
								</div>
								<div>
									<Label htmlFor="bankName">Bank Name</Label>
									<Input
										id="bankName"
										value={formData.bankName}
										onChange={(e) => handleInputChange("bankName", e.target.value)}
										placeholder="e.g., Dutch-Bangla Bank"
									/>
								</div>
								<div>
									<Label htmlFor="accountHolderName">Account Holder Name</Label>
									<Input
										id="accountHolderName"
										value={formData.accountHolderName}
										onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
										placeholder="Account holder name"
									/>
								</div>
								<div>
									<Label htmlFor="branchName">Branch Name</Label>
									<Input
										id="branchName"
										value={formData.branchName}
										onChange={(e) => handleInputChange("branchName", e.target.value)}
										placeholder="Bank branch name"
									/>
								</div>
							</div>
						</div>

						{/* =============== emergency contact section ================ */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Emergency Contact</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="emergencyName">Contact Name *</Label>
									<Input
										id="emergencyName"
										value={formData.emergencyName}
										onChange={(e) => handleInputChange("emergencyName", e.target.value)}
										placeholder="Emergency contact name"
										required
									/>
								</div>
								<div>
									<Label htmlFor="emergencyPhone">Contact Phone *</Label>
									<Input
										id="emergencyPhone"
										value={formData.emergencyPhone}
										onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
										placeholder="+8801234567890"
										required
									/>
								</div>
								<div className="md:col-span-2">
									<Label htmlFor="emergencyRelationship">Relationship *</Label>
									<Input
										id="emergencyRelationship"
										value={formData.emergencyRelationship}
										onChange={(e) => handleInputChange("emergencyRelationship", e.target.value)}
										placeholder="e.g., Father, Mother, Spouse, Brother"
										required
									/>
								</div>
							</div>
						</div>

						{/* =============== service areas and working hours section ================ */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Service Areas & Working Hours</h3>
							<div>
								<Label htmlFor="serviceAreas">Service Areas *</Label>
								<Input
									id="serviceAreas"
									value={formData.serviceAreas}
									onChange={(e) => handleInputChange("serviceAreas", e.target.value)}
									placeholder="e.g., Dhaka, Chittagong, Sylhet (comma separated)"
									required
								/>
								<p className="text-sm text-muted-foreground mt-1">
									Enter cities where you can deliver orders, separated by commas
								</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="workingStart">Working Start Time *</Label>
									<Input
										id="workingStart"
										type="time"
										value={formData.workingStart}
										onChange={(e) => handleInputChange("workingStart", e.target.value)}
										required
									/>
								</div>
								<div>
									<Label htmlFor="workingEnd">Working End Time *</Label>
									<Input
										id="workingEnd"
										type="time"
										value={formData.workingEnd}
										onChange={(e) => handleInputChange("workingEnd", e.target.value)}
										required
									/>
								</div>
							</div>
							<div>
								<Label>Working Days *</Label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
									{["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
										(day) => (
											<label key={day} className="flex items-center space-x-2">
												<Checkbox
													checked={formData.workingDays.includes(day)}
													onCheckedChange={(checked) =>
														handleWorkingDaysChange(day, Boolean(checked))
													}
												/>
												<span className="text-sm capitalize">{day}</span>
											</label>
										)
									)}
								</div>
							</div>
						</div>

						<Button type="submit" disabled={isLoading} className="w-full">
							{isLoading
								? isUpdate
									? "Updating Profile..."
									: "Creating Profile..."
								: isUpdate
								? "Update Rider Profile"
								: "Create Rider Profile"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
