import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clientIdConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientSecretConfigured: Boolean(
      process.env.GOOGLE_CLIENT_SECRET
    ),
  });
}