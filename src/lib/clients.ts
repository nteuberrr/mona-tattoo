import type { Booking } from "@/lib/mock-bookings";

export type ClientSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalSpent: number;
  firstBooking: string;
  lastBooking: string;
};

export function groupBookingsByClient(bookings: Booking[]): ClientSummary[] {
  const byEmail = new Map<string, Booking[]>();
  for (const b of bookings) {
    const key = (b.client.email || b.client.name || b.client.id).toLowerCase();
    if (!key) continue;
    const list = byEmail.get(key) ?? [];
    list.push(b);
    byEmail.set(key, list);
  }

  const out: ClientSummary[] = [];
  byEmail.forEach((list, key) => {
    const first = list[0];
    const dates = list.map((b) => b.date).filter(Boolean).sort();
    out.push({
      id: key,
      name: first.client.name,
      email: first.client.email,
      phone: first.client.phone,
      totalBookings: list.length,
      completedBookings: list.filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED").length,
      pendingBookings: list.filter((b) => b.status === "PENDING_CONFIRMATION" || b.status === "QUOTED").length,
      totalSpent: list
        .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((acc, b) => acc + (b.totalPrice || 0), 0),
      firstBooking: dates[0] ?? "",
      lastBooking: dates[dates.length - 1] ?? ""
    });
  });

  return out.sort((a, b) => b.lastBooking.localeCompare(a.lastBooking));
}

export function findClientBookings(bookings: Booking[], clientKey: string): Booking[] {
  return bookings.filter((b) => {
    const key = (b.client.email || b.client.name || b.client.id).toLowerCase();
    return key === clientKey.toLowerCase();
  });
}
