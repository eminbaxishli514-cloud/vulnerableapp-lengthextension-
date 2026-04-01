import { NextResponse } from "next/server";
import { extendSha256, utf8ToBytes, concatBytes, bytesToPercentEncoded } from "@/lib/sha256";

type ForgeBody = {
  originalMessageBase64: string;
  originalHash: string;
  guessedSecretLength: number;
  appendText: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ForgeBody;
  const originalMessage = Buffer.from(body.originalMessageBase64, "base64");
  const appendBytes = utf8ToBytes(body.appendText);

  if (!Number.isInteger(body.guessedSecretLength) || body.guessedSecretLength < 1 || body.guessedSecretLength > 128) {
    return NextResponse.json({ error: "Secret length guess must be an integer between 1 and 128." }, { status: 400 });
  }

  try {
    const { newDigestHex, gluePadding } = extendSha256(
      body.originalHash,
      body.guessedSecretLength + originalMessage.length,
      appendBytes
    );

    const forgedMessage = concatBytes(originalMessage, gluePadding, appendBytes);

    return NextResponse.json({
      forgedHash: newDigestHex,
      forgedMessageBase64: Buffer.from(forgedMessage).toString("base64"),
      forgedMessagePercentEncoded: bytesToPercentEncoded(forgedMessage),
      gluePaddingLength: gluePadding.length
    });
  } catch {
    return NextResponse.json({ error: "Invalid hash format or forge payload." }, { status: 400 });
  }
}
