const fetch = require('node-fetch');

async function fix() {
  const r = await fetch('https://www.webcincodev.com/b2b/public/api/allies');
  const allies = await r.json();
  const bm = allies.find(a => a.nombre.includes('Burger Master'));
  
  if(bm) {
    const prods = [{
      id: 'p1', 
      nombre: 'Hamburguesa Doble Smash', 
      precio: '8.50$', 
      descripcion: 'Doble carne de res, extra queso y tocino.', 
      imagenUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500'
    }];
    
    // Update
    const up = await fetch(`https://www.webcincodev.com/b2b/public/api/allies/${bm.id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ productos: JSON.stringify(prods) }) 
    });
    console.log(await up.json());
  }
}

fix();
