const CACHE_NAME = "my-cache-v1"; // Önbellek ismi
const API_URL = "https://jsonplaceholder.typicode.com/posts/1"; // API URL'i

// DOM elementlerini seç
const fetchButton = document.getElementById("fetch-data");
const clearButton = document.getElementById("clear-cache");
const output = document.getElementById("output");

// İnternet bağlantısını kontrol et
async function checkInternetConnection() {
  try {
    const response = await fetch("https://www.google.com/favicon.ico", {
      mode: "no-cors",
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Veriyi API'den al ve cache'e kaydet
async function fetchAndCacheData() {
  try {
    const response = await fetch(API_URL);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(API_URL, response.clone());
    const data = await response.json();
    return { data, source: "API" };
  } catch (error) {
    throw new Error("Veri API'den alınamadı");
  }
}

// Cache'den veri getir
async function getCachedData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(API_URL);
    if (cachedResponse) {
      const data = await cachedResponse.json();
      return { data, source: "Cache" };
    }
    return null;
  } catch (error) {
    throw new Error("Cache'den veri alınamadı");
  }
}

// Veriyi getir (internet durumuna göre API veya cache'den)
async function getData() {
  try {
    output.textContent = "Veri getiriliyor...";

    // Önce cache'i kontrol et
    const cachedData = await getCachedData();

    // İnternet bağlantısını kontrol et
    const isOnline = await checkInternetConnection();

    if (isOnline) {
      // İnternet varsa API'den al ve cache'e kaydet
      const { data } = await fetchAndCacheData();
      output.textContent = `Veri API'den alındı ve önbelleğe kaydedildi: ${JSON.stringify(
        data
      )}`;
      console.log("Veri API'den alındı ve önbelleğe kaydedildi");
    } else if (cachedData) {
      // İnternet yoksa ve cache'de veri varsa
      output.textContent = `İnternet bağlantısı yok! Veri önbellekten alındı: ${JSON.stringify(
        cachedData.data
      )}`;
      console.log("Veri önbellekten alındı (offline mod)");
    } else {
      // Ne internet var ne de cache'de veri var
      output.textContent =
        "Veri alınamadı! İnternet bağlantısı yok ve önbellekte veri bulunamadı.";
      console.log("Veri alınamadı - Bağlantı yok ve önbellek boş");
    }
  } catch (error) {
    output.textContent = `Hata: ${error.message}`;
    console.error("Hata:", error);
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
