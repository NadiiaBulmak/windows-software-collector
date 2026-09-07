import 'dotenv/config';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL as string;
const API_TOKEN = process.env.API_TOKEN as string;

if (!N8N_WEBHOOK_URL || !API_TOKEN) {
  console.error('❌ Помилка: N8N_WEBHOOK_URL або API_TOKEN не знайдено у файлі .env');
  process.exit(1);
}

async function testConnection() {
  console.log(`🔗 Спроба з'єднання з: ${N8N_WEBHOOK_URL}`);
  
  const testPayload = {
    message: "Hello from Windows Collector test script!",
    timestamp: new Date().toISOString()
  };
  console.log(`Точно відправляємо заголовок -> Authorization: Bearer ${API_TOKEN}`);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      console.log(`✅ Успіх! З'єднання встановлено. Статус: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      if (responseText) {
        console.log(`📄 Відповідь сервера: ${responseText}`);
      }
    } else {
      console.error(`❌ Помилка сервера: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Деталі: ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ Мережева помилка. Не вдалося з'єднатися.`);
    console.error(`Перевірте, чи правильний URL і чи є доступ до інтернету/сервера.`);
    console.error(error);
  }
}

testConnection();