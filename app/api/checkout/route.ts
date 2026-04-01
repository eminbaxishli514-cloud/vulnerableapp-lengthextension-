import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { vulnerableSign } from "@/lib/payment";
import { bytesToPercentEncoded, utf8ToBytes } from "@/lib/sha256";
import { CATALOG } from "@/lib/catalog";

type CartLine = {
  itemId: keyof typeof CATALOG;
  quantity: number;
};

type CheckoutBody = {
  cart: CartLine[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutBody;
  if (!Array.isArray(body.cart) || body.cart.length === 0 || body.cart.length > 20) {
    return NextResponse.json({ error: "Cart is empty or invalid." }, { status: 400 });
  }

  let amount = 0;
  const itemTokens: string[] = [];
  const linePreview: string[] = [];

  for (const line of body.cart) {
    const product = CATALOG[line.itemId];
    if (!product) {
      return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
      return NextResponse.json({ error: "Each quantity must be between 1 and 20." }, { status: 400 });
    }

    amount += product.price * line.quantity;
    itemTokens.push(`${line.itemId}:${line.quantity}`);
    linePreview.push(`${product.title} x${line.quantity}`);
  }

  if (amount < 1 || amount > 1000000) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  const nonce = crypto.randomUUID().slice(0, 8);
  const message = `user=arif&amount=${amount}&to=shop&items=${itemTokens.join(",")}&nonce=${nonce}`;
  const messageBytes = utf8ToBytes(message);

  return NextResponse.json({
    item: linePreview.join(" | "),
    amount,
    message,
    payUrl: `/api/pay?${bytesToPercentEncoded(messageBytes)}&hash=${vulnerableSign(messageBytes)}`
  });
}
