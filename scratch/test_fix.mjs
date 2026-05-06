const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function runTest() {
    const BASE_URL = 'https://deliveryexpressmg.com/api';
    const chatId = 'test_order_999';
    const clienteId = 'client_test';
    const motorizadoId = 'driver_test';

    console.log('--- TEST 1: Enviar Mensaje (Cliente -> Motorizado) ---');
    try {
        const response = await fetch(`${BASE_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: chatId,
                remitenteId: clienteId,
                remitenteNombre: 'Cliente de Prueba',
                texto: 'Hola, ¿dónde vienes?'
            })
        });
        const data = await response.json();
        console.log('Response:', data);

        if (data.success) {
            console.log('✅ Mensaje enviado con éxito.');
        } else {
            console.error('❌ Error al enviar mensaje.');
        }

        console.log('\n--- TEST 2: Recuperar Notificaciones (Motorizado) ---');
        // Esperar un poco para que la DB procese
        await new Promise(r => setTimeout(r, 1000));

        const notifRes = await fetch(`${BASE_URL}/notifications?userId=${motorizadoId}`);
        const notifications = await notifRes.json();
        console.log('Notificaciones encontradas:', notifications.length);

        const lastNotif = notifications.find(n => n.tipo === 'mensaje' && n.mensaje.includes('¿dónde vienes?'));
        if (lastNotif) {
            console.log('✅ Notificación recibida correctamente:', lastNotif.titulo);
        } else {
            console.log('⚠️ No se encontró la notificación específica. Podría ser que el chatId no esté asociado a un pedido real en la DB para el mapeo.');
        }

    } catch (error) {
        console.error('Error durante la prueba:', error);
    }
}

runTest();
