import { NextResponse } from "next/server";
import { ADMIN_FLAG, getLastValue, parseQueryStringBytes, vulnerableSign } from "@/lib/payment";

type Body = {
  messageBase64: string;
  hash: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const messageBytes = Buffer.from(body.messageBase64, "base64");
  const valid = vulnerableSign(messageBytes) === body.hash;

  const parsed = parseQueryStringBytes(messageBytes);
  const user = getLastValue(parsed, "user");
  const role = getLastValue(parsed, "role");
  const isAdmin = valid && role === "admin";

  return NextResponse.json({
    valid,
    user,
    role,
    adminActionAllowed: isAdmin,
    flag: isAdmin ? ADMIN_FLAG : null
  });
}
