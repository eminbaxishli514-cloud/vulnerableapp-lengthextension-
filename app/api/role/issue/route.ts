import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { bytesToPercentEncoded, utf8ToBytes } from "@/lib/sha256";
import { vulnerableSign } from "@/lib/payment";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("user") ?? "guest").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "guest";
  const nonce = crypto.randomUUID().slice(0, 8);
  const message = `user=${username}&role=user&nonce=${nonce}`;
  const bytes = utf8ToBytes(message);

  return NextResponse.json({
    message,
    messageBase64: Buffer.from(bytes).toString("base64"),
    messagePercentEncoded: bytesToPercentEncoded(bytes),
    hash: vulnerableSign(bytes)
  });
}
