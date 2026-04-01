"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCT_LIST, ProductId } from "@/lib/catalog";
import { CartState, loadCart, saveCart } from "@/lib/cart-client";
import AuthPanel from "@/components/AuthPanel";
import { logout, subscribeAuth } from "@/lib/auth-client";
import { User } from "firebase/auth";

type CheckoutResponse = { item: string; amount: number; message: string; payUrl: string };
const IDS = PRODUCT_LIST.map((p) => p.id);

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<CartState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const un = subscribeAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => un();
  }, []);

  useEffect(() => {
    if (!user) return;
    setCart(loadCart(IDS));
  }, [user]);

  useEffect(() => {
    if (!cart) return;
    saveCart(cart);
  }, [cart]);

  const total = useMemo(() => {
    if (!cart) return 0;
    return PRODUCT_LIST.reduce((acc, p) => acc + p.price * cart[p.id], 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    if (!cart) return 0;
    return IDS.reduce((acc, id) => acc + cart[id], 0);
  }, [cart]);

  const changeQty = (id: ProductId, qty: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      const safeQty = Number.isFinite(qty) ? Math.max(0, Math.min(20, Math.trunc(qty))) : 0;
      return { ...prev, [id]: safeQty };
    });
  };

  const checkout = async () => {
    if (!cart) return;
    setError("");
    if (itemCount === 0) {
      setError("Your cart is empty.");
      return;
    }

    const payload = IDS.filter((id) => cart[id] > 0).map((id) => ({ itemId: id, quantity: cart[id] }));
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: payload })
    });
    const data = (await res.json()) as CheckoutResponse | { error: string };
    if (!res.ok) {
      setError((data as { error: string }).error ?? "Checkout failed.");
      return;
    }
    window.location.href = (data as CheckoutResponse).payUrl;
  };

  if (!authReady) {
    return <div className="auth-wrap"><p className="store-tagline">Loading...</p></div>;
  }

  if (!user) {
    return <AuthPanel title="Sign in to access your cart" />;
  }

  return (
    <div className="page store-page">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="logo">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">MarketPlace</span>
          </a>
          <div className="header-actions">
            <Link href="/" className="header-link">
              Store
            </Link>
            <button className="header-link auth-switch" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="store-main">
        <div className="store-hero">
          <h1>Your cart</h1>
          <p className="store-tagline">Review quantities and continue to payment</p>
        </div>

        <section className="cart-page">
        {PRODUCT_LIST.map((product) => (
          <div className="cart-item" key={product.id}>
            <div className="cart-item-image">{product.emoji}</div>
            <div className="cart-item-details">
              <p className="cart-item-name">{product.title}</p>
              <p className="cart-item-qty">${product.price.toFixed(2)} each</p>
            </div>
            <input
              type="number"
              min={0}
              max={20}
              value={cart?.[product.id] ?? 0}
              onChange={(e) => changeQty(product.id, Number(e.target.value))}
            />
          </div>
        ))}
        <div className="total-row">
          <span>{itemCount} items</span>
          <b>Total: ${total}</b>
        </div>
        <button className="primary" onClick={checkout}>
          Proceed to Payment
        </button>
        {error && <p className="danger">{error}</p>}
        </section>
      </main>
    </div>
  );
}
