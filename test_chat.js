const fetch = require('node-fetch');

async function test() {
  try {
    const postRes = await fetch('https://www.webcincodev.com/b2b/public/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: 'test_chat_123',
        remitenteId: 'user1',
        remitenteNombre: 'Tester',
        texto: 'Hello from Node'
      })
    });
    console.log('POST status:', postRes.status);
    const postText = await postRes.text();
    console.log('POST body:', postText);

    const getRes = await fetch('https://www.webcincodev.com/b2b/public/api/messages?chatId=test_chat_123');
    console.log('GET status:', getRes.status);
    const getText = await getRes.json();
    console.log('GET body:', getText);
  } catch (e) {
    console.error(e);
  }
}
test();
