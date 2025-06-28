import { CartProvider } from "@/hooks/useCart";

export function CartContextProvider({ children }: { children: React.ReactNode }) {
	return <CartProvider>{children}</CartProvider>;
}
