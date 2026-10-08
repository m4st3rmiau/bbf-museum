import type { Artwork } from "./types";
const demos = [
  ["milo", "Milo", "12", "Una pelota, mil aventuras", "Nunca necesitó mucho para ser feliz. Su pelota, un poco de sol y nosotros a su lado. La guardamos para recordar que las mejores cosas siempre fueron las más sencillas.", "dog-1.jpg", "ball.jpg"],
  ["luna", "Luna", "15", "Su lugar en el mundo", "Esta mantita fue su rincón favorito. Aún parece guardar el calor de todas esas tardes en las que se quedaba dormida junto a nosotros.", "cat-1.jpg", "blanket.jpg"],
  ["bruno", "Bruno", "11", "La hora más feliz", "El sonido de su plato era suficiente para verlo correr por toda la casa. Cada comida era una pequeña celebración que compartíamos.", "dog-2.jpg", "bowl.jpg"],
  ["nina", "Nina", "14", "Siempre a mi lado", "Su collar nos acompañó en tantos caminos. Ahora lo conservamos como un recuerdo de todos los lugares que descubrimos juntos.", "cat-2.jpg", "collar.jpg"],
  ["toby", "Toby", "10", "Vamos a dar una vuelta", "En cuanto veía su correa, todo se convertía en alegría. Los paseos eran su manera de recordarnos que siempre hay algo nuevo por descubrir.", "dog-3.jpg", "leash.jpg"],
  ["simba", "Simba", "13", "Un compañero de sueños", "Era su juguete favorito. Lo llevaba de una habitación a otra, como si también necesitara mostrarle cada pequeño descubrimiento.", "cat-3.jpg", "plush.jpg"],
];
export const demoArtworks: Artwork[] = demos.map(([id, petName, age, title, description, pet, object]) => ({ id: `demo-${id}`, petName, age, title, description, petImage: `/images/${pet}`, objectImage: `/images/${object}`, createdAt: "2026-01-01T00:00:00.000Z", demo: true }));
