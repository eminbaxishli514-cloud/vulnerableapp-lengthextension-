import { NextResponse } from "next/server";
import { FLAG, getLastValue, parseQueryStringBytes, safeSign, vulnerableSign } from "@/lib/payment";

type VerifyBody = {
  messageBase64: string;
  hash: string;
  mode: "vulnerable" | "safe";
};

export async function POST(req: Request) {
  const body = (await req.json()) as VerifyBody;
  const messageBytes = Buffer.from(body.messageBase64, "base64");

  const expected = body.mode === "safe" ? safeSign(messageBytes) : vulnerableSign(messageBytes);
  const valid = expected === body.hash;

  const fields = parseQueryStringBytes(messageBytes);
  const user = getLastValue(fields, "user");
  const to = getLastValue(fields, "to");
  const amountRaw = getLastValue(fields, "amount");
  const amount = Number.parseInt(amountRaw ?? "0", 10);

  const forgedSuccess =
    valid && body.mode === "vulnerable" && user === "arif" && to === "shop" && Number.isFinite(amount) && amount >= 100000;

  return NextResponse.json({
    valid,
    mode: body.mode,
    parsed: {
      user,
      to,
      amount: Number.isFinite(amount) ? amount : null
    },
    flag: forgedSuccess ? FLAG : null
  });
}
