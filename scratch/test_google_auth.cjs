async function test() {
    try {
        const res = await fetch('https://deliveryexpressmg.com/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Google Test Ally',
                email: 'google_test_ally_' + Date.now() + '@gmail.com',
                google_id: 'google_' + Date.now(),
                fotoUrl: 'https://example.com/photo.jpg',
                rol: 'aliado'
            })
        });
        const data = await res.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
