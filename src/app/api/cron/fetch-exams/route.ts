import { NextResponse } from "next/server";

export async function GET() {
  // Simulating cron job running successfully
  console.log("Running exam fetcher cron job...");
  
  return NextResponse.json({ success: true, message: "Exam fetcher initiated successfully", timestamp: new Date().toISOString() });
}