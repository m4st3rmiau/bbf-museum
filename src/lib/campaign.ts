export const campaign = {
  name: "Bye Bye Friend",
  title: "El museo de las huellas",
  // Place the supplied GLB in public/models and set e.g. "/models/campaign.glb".
  // For glTF, keep its .bin/textures at the relative paths declared by the file.
  centralModel: { url: null as string | null, height: 2.4, rotationY: 0 },
  // Information shown when the visitor clicks the central exhibit. Replace with the campaign copy.
  centralInfo: {
    eyebrow: "BYE BYE FRIEND",
    title: "El amor deja huellas",
    description: "Cada historia de esta sala nace de un vínculo que no se rompe. Esta figura nos recuerda que quienes amamos dejan huellas que permanecen: en un objeto, en un hogar y en nosotros.",
  },
};
