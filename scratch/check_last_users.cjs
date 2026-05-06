const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/TERA/Documents/delivery-pro-master/scratch/users_api.json', 'utf8'));
const lastUsers = data.slice(-10);
console.log('--- LAST 10 USERS ---');
lastUsers.forEach(u => {
    console.log(`${u.nombre} | ${u.email} | Rol: ${u.rol} | Aprobado: ${u.aprobado} | Created: ${u.created_at}`);
});
