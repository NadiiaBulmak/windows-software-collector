import { getDeviceInfo } from "./src/collectors/system";
import {
  getRegistryApplications,
  getAppXApplications,
} from "./src/collectors/collectors";
import { InventoryPayload, ApplicationInfo } from "./src/types";
import "dotenv/config";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL as string;
const API_TOKEN = process.env.API_TOKEN as string;

function deduplicateApps(apps: ApplicationInfo[]): ApplicationInfo[] {
  const map = new Map<string, ApplicationInfo>();

  for (const app of apps) {
    const key = app.name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, app);
    }
  }

  return Array.from(map.values());
}

async function main() {
  console.log("Збір інформації про пристрій...");
  const device = getDeviceInfo();

  console.log("Збір застосунків з Registry...");
  const registryApps = getRegistryApplications();

  console.log("Збір застосунків з AppX/MSIX...");
  const appxApps = getAppXApplications();

  console.log("Дедуплікація та злиття...");
  const allApps = [...registryApps, ...appxApps];
  const uniqueApps = deduplicateApps(allApps);

  const payload: InventoryPayload = {
    schemaVersion: "1.0",
    collectedAt: new Date().toISOString(),
    device,
    applications: uniqueApps,
  };

  console.log(
    `Знайдено унікальних застосунків: ${payload.applications.length}`,
  );

  try {
    console.log("Відправка даних у n8n...");
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Дані успішно відправлено!");
    } else {
      console.error(
        `Помилка відправки: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Не вдалося з'єднатися з сервером:", error);
  }
}

main();
