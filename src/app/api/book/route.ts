import { NextResponse } from "next/server";
import { BookingRecord } from "@/types/flight";
import { generateBookingRef } from "@/utils/mockBookingGenerator";

const bookings: Record<string, BookingRecord> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ref = generateBookingRef();
    const created: BookingRecord = {
      ref,
      createdAt: Date.now(),
      passengers: body.passengers,
      outboundId: body.outboundId,
      inboundId: body.inboundId ?? null,
      total: body.total,
      user: body.user && typeof body.user === 'object' ? { username: body.user.username } : null,
    };
    bookings[ref] = created;
    return NextResponse.json({ ok: true, bookingRef: ref });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to create booking" }, { status: 400 });
  }
}

export async function GET() {
  // list most recent (debug)
  return NextResponse.json({ count: Object.keys(bookings).length });
}
