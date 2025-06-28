"use client";

import React from "react";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { IProduct } from "@/types/product";

export type CartItem = {
	product: IProduct;
	quantity: number;
};

interface CartContextType {
	cart: CartItem[];
	addToCart: (product: IProduct, quantity?: number) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	removeFromCart: (productId: string) => void;
	clearCart: () => void;
	subtotal: number;
	totalItems: number;
	isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// =============== localStorage key ================
const CART_STORAGE_KEY = "ecommerce-cart";

export function CartProvider({ children }: { children: ReactNode }) {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isMounted, setIsMounted] = useState(false);

	// =============== load cart from localStorage on mount ================
	useEffect(() => {
		try {
			const savedCart = localStorage.getItem(CART_STORAGE_KEY);
			if (savedCart) {
				const parsedCart = JSON.parse(savedCart);
				setCart(parsedCart);
			}
		} catch (error) {
			console.error("Failed to load cart from localStorage:", error);
		}
		setIsMounted(true);
	}, []);

	// =============== save cart to localStorage whenever it changes ================
	useEffect(() => {
		if (isMounted) {
			try {
				localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
			} catch (error) {
				console.error("Failed to save cart to localStorage:", error);
			}
		}
	}, [cart, isMounted]);

	// =============== add product to cart ================
	const addToCart = (product: IProduct, quantity: number = 1) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.product._id === product._id);
			if (existing) {
				return prev.map((item) =>
					item.product._id === product._id
						? { ...item, quantity: item.quantity + quantity }
						: item
				);
			}
			return [...prev, { product, quantity }];
		});
	};

	// =============== update product quantity ================
	const updateQuantity = (productId: string, quantity: number) => {
		setCart((prev) =>
			prev.map((item) => (item.product._id === productId ? { ...item, quantity } : item))
		);
	};

	// =============== remove product from cart ================
	const removeFromCart = (productId: string) => {
		setCart((prev) => prev.filter((item) => item.product._id !== productId));
	};

	// =============== clear cart ================
	const clearCart = () => setCart([]);

	// =============== subtotal and total items ================
	const subtotal = cart.reduce(
		(sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
		0
	);
	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				updateQuantity,
				removeFromCart,
				clearCart,
				subtotal,
				totalItems,
				isMounted,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) throw new Error("useCart must be used within a CartProvider");
	return context;
}
