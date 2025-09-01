"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBrand } from "@/app/actions/brand";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteBrandButtonProps {
	brandId: string;
	brandName: string;
}

export function DeleteBrandButton({ brandId, brandName }: DeleteBrandButtonProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);

		try {
			const result = await deleteBrand(brandId);

			if (result.success) {
				toast.success("Brand deleted successfully!");
				router.refresh();
			} else {
				toast.error(result.error || "Failed to delete brand");
			}
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm" className="flex items-center gap-2">
					<Trash2 className="w-4 h-4" />
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Brand</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete &quot;{brandName}&quot;? this action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
