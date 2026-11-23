export type User = { public_id: string; email: string; first_name: string; last_name: string; permissions: string[]; must_change_password: boolean; is_activated: boolean };
export type Staff = { public_id: string; name: string };
export type Service = { public_id: string; name: string; description: string; staff: Staff[] };
export type Day = { date: string; available: boolean; free_slots: number; reason: string };
export type Slot = { start: string; end: string; label: string; available: boolean; reason: string; remaining: number; staff_public_ids: string[] };
export type Appointment = { public_id: string; service: string; service_name: string; staff: string; staff_name: string; contact_first_name: string; contact_last_name: string; contact_phone: string; customer_email: string; start_at: string; end_at: string; status: 'confirmed' | 'cancelled'; notes: string; can_cancel: boolean | null; can_reschedule: boolean | null; change_deadline: string | null };
