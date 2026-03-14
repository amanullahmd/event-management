import { redirect } from 'next/navigation';

export default function TicketsRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/organizer/events/${params.id}`);
}
