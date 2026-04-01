"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCT_LIST, ProductId } from "@/lib/catalog";
import { CartState, loadCart, saveCart } from "@/lib/cart-client";
import AuthPanel from "@/components/AuthPanel";
import { logout, subscribeAuth } from "@/lib/auth-client";
import { User } from "firebase/auth";

const IDS = PRODUCT_LIST.map((p) => p.id);

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<CartState | null>(null);
  const [addedMessage, setAddedMessage] = useState<string>("");

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

  const itemCount = useMemo(() => {
    if (!cart) return 0;
    return IDS.reduce((acc, id) => acc + cart[id], 0);
  }, [cart]);

  const addToCart = (id: ProductId, title: string) => {
    setCart((prev) => {
      if (!prev) return prev;
      return { ...prev, [id]: Math.min(prev[id] + 1, 20) };
    });
    setAddedMessage(`${title} added to cart`);
    window.setTimeout(() => setAddedMessage(""), 1300);
  };

  if (!authReady) {
    return <div className="auth-wrap"><p className="store-tagline">Loading...</p></div>;
  }

  if (!user) {
    return <AuthPanel />;
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
            <Link href="/cart" className="cart-toggle">
              <span className="cart-icon">🛒</span>
              <span className="cart-count" data-count={itemCount}>
                {itemCount}
              </span>
            </Link>
            <button className="header-link auth-switch" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="store-main">
        <div className="store-hero">
          <h1>Welcome to MarketPlace</h1>
          <p className="store-tagline">Browse our selection and add items to your cart</p>
        </div>
        {addedMessage && <p className="success">{addedMessage}</p>}

        <section className="products-grid">
          {PRODUCT_LIST.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">{product.emoji}</div>
              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="product-desc">{product.blurb}</p>
                <div className="product-footer">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <button className="btn-add" onClick={() => addToCart(product.id, product.title)}>
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
