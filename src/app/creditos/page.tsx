import { Header, Footer } from "@/components/site-chrome";
const unsplash = [
  ["Milo · John Price", "adultgolden-retriever-wzRQfEw9CMc"],
  ["Bruno · Clay Banks", "shallow-focus-photography-of-short-coated-tan-dog-standing-outdoors-vNiYICrtqdE"],
  ["Toby · Ken Reid", "black-dog-with-white-collar-ZRZSmK362Xw"],
  ["Luna · Lloyd Henneman", "brown-and-white-tabby-cat-mBRfYA0dYYE"],
  ["Nina · Akin Cakiner", "black-cat-3I_k0QRnNW0"],
  ["Simba · Le Tia", "fluffy-brown-tabby-cat-portrait-POZq70p0EW0"],
  ["Pelota · Jeroen Bosch", "green-tennis-ball-on-green-grass-afcdwWh8BPI"],
  ["Manta · Kateryna Hliznitsova", "a-close-up-of-a-blanket-that-has-been-folded-mvezMC41OAU"],
  ["Peluche · Nadine Förster", "a-white-teddy-bear-wearing-a-red-sweater-pABBDh4rhZA"],
];
export const metadata = { title: "Créditos" };
export default function Credits() { return <><Header /><main className="credits"><span className="eyebrow">LAS IMÁGENES QUE NOS ACOMPAÑAN</span><h1>Créditos y agradecimientos</h1><p>Las seis obras iniciales son ejemplos con nombres e historias ficticias. Las fotografías no representan testimonios de sus autores ni afirman que los animales retratados hayan fallecido.</p><h2>Fotografías de Unsplash</h2><p>Fotografías bajo la <a href="https://unsplash.com/license">licencia de Unsplash</a>, descargadas a 900 píxeles y comprimidas para esta demostración.</p><ul>{unsplash.map(([label, path]) => <li key={path}><a href={`https://unsplash.com/photos/${path}`}>{label}</a></li>)}</ul><h2>Fotografías de Wikimedia Commons</h2><ul><li><a href="https://commons.wikimedia.org/wiki/File:BuckleCollar_wb.jpg">Collar · Elf</a> — <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>. Imagen sin modificaciones.</li><li><a href="https://commons.wikimedia.org/wiki/File:Large_Dog_food_bowl.jpg">Plato · Ohiopetwatch</a> — <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>. Imagen sin modificaciones.</li><li><a href="https://commons.wikimedia.org/wiki/File:Chain_Leash_crop.jpg">Correa · Wesha</a> — <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. Versión reducida a 960 píxeles, sin otros cambios.</li></ul><h2>El museo</h2><p>La sala y la escultura provisional se construyeron para esta experiencia. La figura de campaña y el logo definitivos se incorporarán cuando estén disponibles.</p></main><Footer /></>; }
