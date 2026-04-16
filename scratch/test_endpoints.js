
import fetch from 'node-fetch';

const API_BASE_URL = 'https://www.webcincodev.com/b2b/public/api';

async function test() {
    console.log("Testing /settings...");
    try {
        const r1 = await fetch(`${API_BASE_URL}/settings`);
        console.log("/settings status:", r1.status);
    } catch (e) { console.log("/settings failed"); }

    console.log("Testing /mototaxi-tarifas...");
    try {
        const r2 = await fetch(`${API_BASE_URL}/mototaxi-tarifas`);
        console.log("/mototaxi-tarifas status:", r2.status);
    } catch (e) { console.log("/mototaxi-tarifas failed"); }
}

test();
