export type CentralModel = {
  url: string;
  height: number;
  maxFootprint: number;
  rotationY: number;
  preserveMaterials?: boolean;
};

export type CentralWork = {
  title: string;
  productName: string;
  description: string;
  moreInfoUrl: string;
};

export type CentralExhibit = {
  model: CentralModel;
  work: CentralWork;
};

const centralWorks = [
  { title: "Para volver a sentirl@ cerquita de ti.", productName: "Memorias de un Guardián", description: "Hay prendas que guardan historias. Convertimos una de las prendas de tu compañer@ de cuatro patas en una creación especial que da nueva vida a los recuerdos y te permite sentirl@ cerca.", moreInfoUrl: "https://recaudo.app/wa/rfvgmenl" },
  { title: "Su recuerdo contigo.", productName: "Charm", description: "Hacemos una pequeña obra de arte en plata con la figura de tu BFF para que lleves su recuerdo siempre contigo.", moreInfoUrl: "https://recaudo.app/wa/eq486r4r" },
  { title: "Las huellitas que siempre recordarás.", productName: "Huella de Vida", description: "Convertimos la huellita de tu Guardián en una pieza de arte personalizada con su nombre y una frase especial, para conservar el recuerdo de aquellos días en los que sus pequeños pasos llenaban tu hogar de alegría.", moreInfoUrl: "https://recaudo.app/wa/9hadjzgy" },
  { title: "Flores que expresan un amor infinito.", productName: "Jardín del Arcoíris", description: "Transformamos las flores en expresiones de arte, creando arreglos únicos que celebran la vida y honran la memoria de tu compañer@ de aventuras.", moreInfoUrl: "https://recaudo.app/wa/qdwy5foa" },
  { title: "Su recuerdo te acompaña en cada paso.", productName: "Relicario", description: "Convertimos los recuerdos de tu chiquitín en una pieza llena de significado. Un relicario que te permite llevar siempre cerca el amor y los momentos que compartieron.", moreInfoUrl: "https://recaudo.app/wa/1ofwqv2z" },
] satisfies CentralWork[];

export const campaign = {
  name: "Bye Bye Friend",
  title: "El museo de las huellas",
  centralWorks,
  centralExhibits: [
    { model: { url: "/models/dog-model.glb", height: 4.97, maxFootprint: 4.54, rotationY: -0.28 }, work: centralWorks[0] },
    { model: { url: "/models/Classic-Canine.glb", height: 2.65, maxFootprint: 2.3, rotationY: 0, preserveMaterials: true }, work: centralWorks[1] },
    { model: { url: "/models/Heart-Pendan.glb", height: 3, maxFootprint: 2.6, rotationY: 0, preserveMaterials: true }, work: centralWorks[4] },
    { model: { url: "/models/Huella-de-Vida.glb", height: 3.1, maxFootprint: 2.65, rotationY: Math.PI, preserveMaterials: true }, work: centralWorks[2] },
    { model: { url: "/models/Pink-Blossoms.glb", height: 3.15, maxFootprint: 3.05, rotationY: 0, preserveMaterials: true }, work: centralWorks[3] },
    { model: { url: "/models/Golden-Paw-Pendant.glb", height: 3, maxFootprint: 2.6, rotationY: 0, preserveMaterials: true }, work: centralWorks[4] },
    { model: { url: "/models/Moonlit-Cat-Pendant.glb", height: 3, maxFootprint: 2.6, rotationY: 0, preserveMaterials: true }, work: centralWorks[4] },
  ] satisfies CentralExhibit[],
};
