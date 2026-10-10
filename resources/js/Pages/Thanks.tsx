import { Head } from "@inertiajs/react";
import { ThankYou } from "@/components/thank-you";
import type { Artwork } from "@/lib/types";

export default function Thanks({ artwork }: { artwork: Artwork }) { return <><Head title="Su huella ya tiene un lugar" /><ThankYou artwork={artwork} /></>; }
