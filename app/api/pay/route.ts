import { NextResponse } from "next/server";
import { FLAG, getLastValue, parseQueryStringBytes, vulnerableSign } from "@/lib/payment";
import { percentEncodedToBytes } from "@/lib/sha256";

const html = (title: string, body: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: Segoe UI, sans-serif; background: #060a16; color: #ecf0ff; margin: 0; }
      .wrap { max-width: 860px; margin: 40px auto; padding: 24px; background: #101935; border: 1px solid #283760; border-radius: 12px; }
      code, pre { background: #0a1229; border: 1px solid #25345a; border-radius: 8px; padding: 10px; display: block; overflow-wrap: anywhere; }
      .ok { color: #68ffcf; } .bad { color: #ff7d9a; }
      a { color: #8bc3ff; }
    </style>
  </head>
  <body>
    <main class="wrap">${body}</main>
  </body>
</html>`;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawQuery = url.search.startsWith("?") ? url.search.slice(1) : "";
  const hashMatch = rawQuery.match(/(?:^|&)hash=([0-9a-fA-F]{64})$/);

  if (!hashMatch) {
    return new NextResponse(
      html("Payment Rejected", `<h1 class="bad">Payment rejected</h1><p>Missing or invalid hash.</p>`),
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  const suppliedHash = hashMatch[1].toLowerCase();
  const messagePart = rawQuery.replace(/(?:^|&)hash=[^&]*$/, "").replace(/^&/, "");
  const messageBytes = percentEncodedToBytes(messagePart);
  const expected = vulnerableSign(messageBytes);
  const valid = suppliedHash === expected;

  const parsed = parseQueryStringBytes(messageBytes);
  const user = getLastValue(parsed, "user");
  const to = getLastValue(parsed, "to");
  const amount = Number.parseInt(getLastValue(parsed, "amount") ?? "0", 10);
  const forged = valid && user === "arif" && to === "shop" && Number.isFinite(amount) && amount >= 100000;

  if (!valid) {
    return new NextResponse(
      html(
        "Payment Rejected",
        `<h1 class="bad">Payment rejected</h1><p>Signature mismatch.</p><p><a href="/">Back to market</a></p>`
      ),
      { status: 403, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(
    html(
      "Payment Accepted",
      `<h1 class="ok">Payment accepted</h1>
       <p>User: ${user ?? "unknown"}<br/>Merchant: ${to ?? "unknown"}<br/>Amount: ${amount}</p>
       ${forged ? `<h2 class="ok">FLAG: ${FLAG}</h2>` : `<p>Payment successful.</p>`}
       <p><a href="/">Back to market</a></p>`
    ),
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
