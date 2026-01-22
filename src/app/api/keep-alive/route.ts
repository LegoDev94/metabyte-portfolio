import { NextResponse } from "next/server";

// Self-ping endpoint to keep Render service awake
// Called every 10 minutes by the client-side keep-alive mechanism

export async function GET() {
  return NextResponse.json({
    status: "alive",
    timestamp: new Date().toISOString()
  });
}
