const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/TERA/Documents/delivery-pro-master/scratch/users_api.json', 'utf8'));
const aliados = data.filter(u => u.rol === 'aliado');
console.log('--- ALL ALIADOS FOUND ---');
aliados.forEach(u => {
    console.log(`${u.nombre} | ${u.email} | Rol: ${u.rol} | Aprobado: ${u.aprobado}`);
});
console.log('Total:', aliados.length);
