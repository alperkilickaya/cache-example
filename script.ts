interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface DataResponse {
  data: Post;
  source: "API" | "Cache";
}

const CACHE_NAME = "my-cache-v1";
const API_URL = "https://jsonplaceholder.typicode.com/posts/1";

// DOM elementlerini seç
const fetchButton = document.getElementById("fetch-data") as HTMLButtonElement;
const clearButton = document.getElementById("clear-cache") as HTMLButtonElement;
const output = document.getElementById("output") as HTMLDivElement;

// İnternet bağlantısını kontrol et
async function checkInternetConnection(): Promise<boolean> {
  try {
    if (!navigator.onLine) {
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://jsonplaceholder.typicode.com", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log("Bağlantı kontrolü hatası:", error);
    return false;
  }
}

// Veriyi API'den al ve cache'e kaydet
async function fetchAndCacheData(): Promise<DataResponse> {
  try {
    const response = await fetch(API_URL);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(API_URL, response.clone());
    const data = (await response.json()) as Post;
    return { data, source: "API" };
  } catch (error) {
    throw new Error("Veri API'den alınamadı");
  }
}

// Cache'den veri getir
async function getCachedData(): Promise<DataResponse | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(API_URL);
    if (cachedResponse) {
      const data = (await cachedResponse.json()) as Post;
      return { data, source: "Cache" };
    }
    return null;
  } catch (error) {
    throw new Error("Cache'den veri alınamadı");
  }
}

// Veriyi getir (internet durumuna göre API veya cache'den)
async function getData(): Promise<void> {
  try {
    output.textContent = "Veri getiriliyor...";

    const cachedData = await getCachedData();
    const isOnline = await checkInternetConnection();

    if (isOnline) {
      const { data } = await fetchAndCacheData();
      output.textContent = `Veri API'den alındı ve önbelleğe kaydedildi: ${JSON.stringify(
        data
      )}`;
      console.log("Veri API'den alındı ve önbelleğe kaydedildi");
    } else if (cachedData) {
      output.textContent = `İnternet bağlantısı yok! Veri önbellekten alındı: ${JSON.stringify(
        cachedData.data
      )}`;
      console.log("Veri önbellekten alındı (offline mod)");
    } else {
      output.textContent =
        "Veri alınamadı! İnternet bağlantısı yok ve önbellekte veri bulunamadı.";
      console.log("Veri alınamadı - Bağlantı yok ve önbellek boş");
    }
  } catch (error) {
    if (error instanceof Error) {
      output.textContent = `Hata: ${error.message}`;
      console.error("Hata:", error);
    }
  }
}

// Event Listeners
fetchButton.addEventListener("click", getData);

// Önbelleği temizle
clearButton.addEventListener("click", async () => {
  try {
    await caches.delete(CACHE_NAME);
    output.textContent = "Önbellekteki veri başarıyla silindi!";
    console.log("Önbellek temizlendi");
  } catch (error) {
    output.textContent = "Önbellekteki veri silinemedi!";
    console.error("Önbellek temizleme hatası:", error);
  }
});
