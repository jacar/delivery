async function test() {
    try {
        const res = await fetch('https://deliveryexpressmg.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Test Ally Request ' + Date.now(),
                email: 'test_ally_' + Date.now() + '@example.com',
                password: 'password123',
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
