import { ProductId } from "./catalog";

export type CartState = Record<ProductId, number>;
const KEY = "atlas_market_cart_v1";

export const emptyCart = (ids: ProductId[]): CartState => {
  const out = {} as CartState;
  for (const id of ids) out[id] = 0;
  return out;
};

export const loadCart = (ids: ProductId[]): CartState => {
  if (typeof window === "undefined") return emptyCart(ids);
  const fallback = emptyCart(ids);
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const id of ids) {
      const value = parsed[id];
      fallback[id] =
        typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(20, Math.trunc(value))) : 0;
    }
  } catch {
    return fallback;
  }
  return fallback;
};

export const saveCart = (cart: CartState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cart));
};
