import { NextResponse } from "next/server";
import { BASE_PAYMENT_MESSAGE, safeSign, vulnerableSign } from "@/lib/payment";
import { bytesToPercentEncoded, utf8ToBytes } from "@/lib/sha256";

export async function GET() {
  const messageBytes = utf8ToBytes(BASE_PAYMENT_MESSAGE);
  const vulnerableHash = vulnerableSign(messageBytes);
  const safeHash = safeSign(messageBytes);

  return NextResponse.json({
    message: BASE_PAYMENT_MESSAGE,
    messageBase64: Buffer.from(messageBytes).toString("base64"),
    messagePercentEncoded: bytesToPercentEncoded(messageBytes),
    vulnerableHash,
    safeHash
  });
}
