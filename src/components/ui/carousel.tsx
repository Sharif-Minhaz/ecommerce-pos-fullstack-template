"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CarouselContext = React.createContext<{
	currentSlide: number;
	totalSlides: number;
	setCurrentSlide: (slide: number) => void;
	setTotalSlides: (total: number) => void;
} | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);
	if (!context) {
		throw new Error("useCarousel must be used within a CarouselProvider");
	}
	return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function Carousel({ children, className, ...props }: CarouselProps) {
	const [currentSlide, setCurrentSlide] = React.useState(0);
	const [totalSlides, setTotalSlides] = React.useState(0);

	return (
		<CarouselContext.Provider
			value={{ currentSlide, totalSlides, setCurrentSlide, setTotalSlides }}
		>
			<div className={cn("relative", className)} {...props}>
				{children}
			</div>
		</CarouselContext.Provider>
	);
}

export function CarouselContent({ children, className, ...props }: CarouselProps) {
	const slides = React.Children.toArray(children);
	const { setTotalSlides } = useCarousel();

	React.useEffect(() => {
		setTotalSlides(slides.length);
	}, [slides.length, setTotalSlides]);

	return (
		<div className={cn("relative overflow-hidden", className)} {...props}>
			<div className="flex transition-transform duration-300 ease-in-out">{children}</div>
		</div>
	);
}

export function CarouselItem({ children, className, ...props }: CarouselProps) {
	const { currentSlide } = useCarousel();
	return (
		<div
			className={cn(
				"min-w-full flex-shrink-0 transition-transform duration-300 ease-in-out",
				className
			)}
			style={{ transform: `translateX(-${currentSlide * 100}%)` }}
			{...props}
		>
			{children}
		</div>
	);
}

export function CarouselPrevious({ className, ...props }: React.ComponentProps<typeof Button>) {
	const { currentSlide, setCurrentSlide, totalSlides } = useCarousel();
	return (
		<Button
			variant="outline"
			size="icon"
			className={cn("absolute left-2 top-1/2 -translate-y-1/2", className)}
			onClick={() => setCurrentSlide((currentSlide - 1 + totalSlides) % totalSlides)}
			{...props}
		>
			<ChevronLeft className="h-4 w-4" />
			<span className="sr-only">Previous slide</span>
		</Button>
	);
}

export function CarouselNext({ className, ...props }: React.ComponentProps<typeof Button>) {
	const { currentSlide, setCurrentSlide, totalSlides } = useCarousel();
	return (
		<Button
			variant="outline"
			size="icon"
			className={cn("absolute right-2 top-1/2 -translate-y-1/2", className)}
			onClick={() => setCurrentSlide((currentSlide + 1) % totalSlides)}
			{...props}
		>
			<ChevronRight className="h-4 w-4" />
			<span className="sr-only">Next slide</span>
		</Button>
	);
}
