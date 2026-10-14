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

export const campaign = {
  name: "Bye Bye Friend",
  title: "El museo de las huellas",
  centralModel: { url: "/models/dog-model.glb", height: 4.97, maxFootprint: 4.54, rotationY: -0.28 } satisfies CentralModel,
  secondRoomModel: { url: "/models/Classic-Canine.glb", height: 3.2, maxFootprint: 2.75, rotationY: 0, preserveMaterials: true } satisfies CentralModel,
  centralWorks: [
    { title: "Para volver a sentirl@ cerquita de ti.", productName: "Memorias de un Guardián", description: "Hay prendas que guardan historias. Convertimos una de las prendas de tu compañer@ de cuatro patas en una creación especial que da nueva vida a los recuerdos y te permite sentirl@ cerca.", moreInfoUrl: "https://byebyefriend.mx" },
    { title: "Su recuerdo contigo.", productName: "Charm", description: "Hacemos una pequeña obra de arte en plata con la figura de tu BFF para que lleves su recuerdo siempre contigo.", moreInfoUrl: "https://byebyefriend.mx" },
    { title: "Su amor brillará por siempre.", productName: "Gema del Alma", description: "Transformamos las cenizas de tu travies@ en un diamante único, una obra de arte que conserva su recuerdo y simboliza el amor que siempre los unirá.", moreInfoUrl: "https://byebyefriend.mx" },
    { title: "Las huellitas que siempre recordarás.", productName: "Huella de Vida", description: "Convertimos la huellita de tu Guardián en una pieza de arte personalizada con su nombre y una frase especial, para conservar el recuerdo de aquellos días en los que sus pequeños pasos llenaban tu hogar de alegría.", moreInfoUrl: "https://byebyefriend.mx" },
    { title: "Flores que expresan un amor infinito.", productName: "Jardín del Arcoíris", description: "Transformamos las flores en expresiones de arte, creando arreglos únicos que celebran la vida y honran la memoria de tu compañer@ de aventuras.", moreInfoUrl: "https://byebyefriend.mx" },
    { title: "Su recuerdo te acompaña en cada paso.", productName: "Relicario", description: "Convertimos los recuerdos de tu chiquitín en una pieza llena de significado. Un relicario que te permite llevar siempre cerca el amor y los momentos que compartieron.", moreInfoUrl: "https://byebyefriend.mx" },
  ] satisfies CentralWork[],
};
