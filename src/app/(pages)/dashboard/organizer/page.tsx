import { redirect } from "next/navigation";

export default async function OrganizerPageDB() {
  redirect("/dashboard/organizer/events");
}
