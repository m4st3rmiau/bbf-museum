import { Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Loader2 } from "lucide-react";
import { useDraft } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { contactSchema, artworkSchema, type ContactFields } from "@/lib/validation";
import { useBlobUrl } from "@/hooks/use-blob-url";
export default function ContactForm() {
  const { draft, contact, setContact, demoMode, clear } = useDraft(); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const lock = useRef(false); const petUrl = useBlobUrl(draft.petImage);
  const { register, control, handleSubmit, getValues, reset, formState: { errors } } = useForm<ContactFields>({ resolver: zodResolver(contactSchema), defaultValues: contact });
  useEffect(() => { if (demoMode && contact.name) reset(contact); }, [demoMode, contact, reset]);
  function submit(fields: ContactFields) {
    if (lock.current) return;
    if (!artworkSchema.safeParse(draft).success || !draft.petImage || !draft.objectImage) { setError("Revisa los datos de la obra en el paso anterior."); return; }
    lock.current = true; setSaving(true); setError(""); setContact(fields);
    router.post("/obras", {
      pet_name: draft.petName, age: draft.age, title: draft.title, description: draft.description,
      pet_image: draft.petImage, object_image: draft.objectImage,
      contact_name: fields.name, email: fields.email, phone: fields.phone, interest: fields.interest,
    }, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => clear(),
      onError: errors => { setError(String(errors.submission ?? Object.values(errors)[0] ?? "No pudimos registrar la obra. Revisa los datos e inténtalo nuevamente.")); lock.current = false; setSaving(false); },
      onCancel: () => { lock.current = false; setSaving(false); },
    });
  }
  if (!draft.petImage || !draft.objectImage) return <div className="empty-state form-empty-state"><Heart size={36} /><h1>Comencemos por su historia.</h1><p>Primero agrega sus fotografías y el recuerdo que quieres compartir.</p><Button asChild><Link href="/exhibir">Crear su obra</Link></Button></div>;
  return <div className="form-container"><div className="form-heading"><h1>Detrás de cada huella,<br /><em>hay alguien como tú.</em></h1><p>Un último paso para exhibir su historia.</p></div><div className="form-grid contact-grid"><form onSubmit={handleSubmit(submit)} noValidate onBlur={() => setContact(getValues())}><div className="field"><label htmlFor="name">Tu nombre</label><Input id="name" autoComplete="name" placeholder="Ej. Ana Pérez" {...register("name")} aria-invalid={!!errors.name} /><p className="field-error" role="alert">{errors.name?.message}</p></div><div className="field"><label htmlFor="phone">Teléfono</label><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="55 5651 8029" {...register("phone")} aria-invalid={!!errors.phone} /><p className="field-error" role="alert">{errors.phone?.message}</p></div><div className="field"><label htmlFor="email">Correo electrónico</label><Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="juan.perez@gmail.com" {...register("email")} aria-invalid={!!errors.email} /><p className="field-error" role="alert">{errors.email?.message}</p></div><fieldset className="interest-field"><legend>¿Has pensado en el Servicio Funerario a Futuro de tu Animal de Compañía?</legend><Controller name="interest" control={control} render={({ field }) => <RadioGroup onValueChange={field.onChange} value={field.value} className="radio-group" aria-label="Interés en servicios funerarios">{[["yes", "Sí, me interesa saber más."], ["later", "Todavía no, pero me gustaría informarme."], ["gallery", "Solo quiero exponer su objeto en la galería."]].map(([value, label]) => <label className="radio-option" key={value}><RadioGroupItem value={value} />{label}</label>)}</RadioGroup>} /></fieldset><p className="consent-note">Al registrarte aceptas recibir información y contenido relacionado con los Servicios Funerarios para Animales de Compañía de Bye Bye Friend. <span>(Aviso de Privacidad)</span></p>{errors.interest && <p className="field-error" role="alert">{errors.interest.message}</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Button type="submit" disabled={saving}>{saving ? <><Loader2 size={18} className="spin" /> Registrando su obra…</> : "Exhibir su obra"}</Button></div></form><aside className="contact-aside">{petUrl && <img src={petUrl} alt={draft.petName} />}<div className="contact-memory"><Heart size={22} /><span>EN MEMORIA DE</span><h2>{draft.petName}</h2><p>“{draft.title}”</p><div className="tiny-line" /><p className="memory-quote">Algunas compañías<br />se quedan para siempre.</p></div></aside></div></div>;
}
