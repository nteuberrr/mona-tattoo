import { NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { bookings, source } = await getAllBookings();
  return NextResponse.json({ bookings, source });
}
