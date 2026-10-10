import { Head } from "@inertiajs/react";
import { ExhibitLayout } from "@/components/exhibit-layout";
import ArtworkForm from "@/components/artwork-form";

export default function Exhibit() { return <><Head title="Exhibir su obra" /><ExhibitLayout><ArtworkForm /></ExhibitLayout></>; }
