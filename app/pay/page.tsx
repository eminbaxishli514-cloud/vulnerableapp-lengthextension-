export default async function PayPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const values = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (typeof raw === "string") values.append(key, raw);
    if (Array.isArray(raw)) raw.forEach((v) => values.append(key, v));
  }

  return (
    <main className="container">
      <h1>Payment URL Preview</h1>
      <p className="subtitle">This page exists for realism. Use the home lab to forge and verify signatures.</p>
      <section className="card">
        <h2>Received Query</h2>
        <div className="code">{values.toString() || "No query string received."}</div>
      </section>
    </main>
  );
}
