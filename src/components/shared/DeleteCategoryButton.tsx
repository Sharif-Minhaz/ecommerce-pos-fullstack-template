"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCategory } from "@/app/actions/category";
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

interface DeleteCategoryButtonProps {
	categoryId: string;
	categoryName: string;
}

export function DeleteCategoryButton({ categoryId, categoryName }: DeleteCategoryButtonProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);

		try {
			const result = await deleteCategory(categoryId);

			if (result.success) {
				toast.success("Category deleted successfully!");
				router.refresh();
			} else {
				toast.error(result.error || "Failed to delete category");
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
					<AlertDialogTitle>Delete Category</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete &quot;{categoryName}&quot;? this action cannot be undone.
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
