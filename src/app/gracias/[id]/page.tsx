import { ThankYou } from "@/components/thank-you";
export const metadata = { title: "Su huella ya tiene un lugar" };
export default async function ThankYouPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ThankYou id={id} />; }
