import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Booking = Tables<"bookings">;
export type BookingStatus = "neu" | "bestaetigt" | "abgeschlossen" | "storniert";

export const BOOKING_STATUS: { id: BookingStatus; label: string }[] = [
  { id: "neu", label: "Neu" },
  { id: "bestaetigt", label: "Bestätigt" },
  { id: "abgeschlossen", label: "Abgeschlossen" },
  { id: "storniert", label: "Storniert" },
];

const clip = (value: FormDataEntryValue | string | null | undefined, max: number) => String(value ?? "").trim().slice(0, max) || null;

/** Stores a website booking request (RLS only allows inserting new requests, never reading them). */
export async function saveBookingRequest(request: Omit<TablesInsert<"bookings">, "status" | "source" | "admin_notes">) {
  const { error } = await supabase.from("bookings").insert({
    ...request,
    customer_name: clip(request.customer_name, 120) ?? "-",
    customer_phone: clip(request.customer_phone, 40) ?? "-",
    location: clip(request.location, 200),
    notes: clip(request.notes, 2000),
    car_label: clip(request.car_label, 160),
  });
  if (error) console.error("[bookings] could not save request", error);
}
