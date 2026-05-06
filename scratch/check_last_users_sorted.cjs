const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/TERA/Documents/delivery-pro-master/scratch/users_api.json', 'utf8'));
const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
const lastUsers = sorted.slice(0, 10);
console.log('--- LAST 10 USERS BY DATE ---');
lastUsers.forEach(u => {
    console.log(`${u.nombre} | ${u.email} | Rol: ${u.rol} | Aprobado: ${u.aprobado} | Created: ${u.created_at}`);
});
