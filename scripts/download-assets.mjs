import { mkdir, writeFile } from 'node:fs/promises';
const images = {
  'dog-1.jpg': 'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?fm=jpg&w=900&q=85',
  'dog-2.jpg': 'https://images.unsplash.com/photo-1564770972270-47ea9f02ba46?fm=jpg&w=900&q=85',
  'dog-3.jpg': 'https://images.unsplash.com/photo-1497993950456-cdb57afd1cf1?fm=jpg&w=900&q=85',
  'cat-1.jpg': 'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?fm=jpg&w=900&q=85',
  'cat-2.jpg': 'https://images.unsplash.com/photo-1535581781942-eff63f5142a7?fm=jpg&w=900&q=85',
  'cat-3.jpg': 'https://images.unsplash.com/photo-1789488112207-41ae74d9caa7?fm=jpg&w=900&q=85',
  'ball.jpg': 'https://images.unsplash.com/photo-1533973269412-434f9b15fb05?fm=jpg&w=900&q=85',
  'plush.jpg': 'https://images.unsplash.com/photo-1694288776044-117c1dd38746?fm=jpg&w=900&q=85',
  'blanket.jpg': 'https://images.unsplash.com/photo-1634120455427-d4db69777fdc?fm=jpg&w=900&q=85',
  'collar.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/10/BuckleCollar_wb.jpg',
  'bowl.jpg': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Large_Dog_food_bowl.jpg',
  'leash.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chain_Leash_crop.jpg/960px-Chain_Leash_crop.jpg',
};
await mkdir('public/images', { recursive: true });
for (const [name, url] of Object.entries(images)) {
  const response = await fetch(url, { headers: { 'User-Agent': 'BBFMuseumPrototype/1.0 (local educational prototype)' } });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${name}: ${response.status}`);
  await writeFile(`public/images/${name}`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}`);
}
