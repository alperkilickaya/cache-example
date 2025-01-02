const CACHE_NAME = "my-cache-v1"; // Önbellek ismi

// DOM elementlerini seç
const cacheButton = document.getElementById("cache-data");
const fetchButton = document.getElementById("fetch-data");
const clearButton = document.getElementById("clear-cache");
const output = document.getElementById("output");

// Önbelleğe bir dosya ekle
cacheButton.addEventListener("click", async () => {
  const cache = await caches.open(CACHE_NAME);
  const url = "https://jsonplaceholder.typicode.com/posts/1"; // Önbelleğe alınacak URL

  try {
    const response = await fetch(url); // Veriyi indir
    await cache.put(url, response.clone()); // Önbelleğe ekle
    output.textContent = "Veri önbelleğe alındı!";
    console.log("Veri önbelleğe alındı:", url);
  } catch (error) {
    output.textContent = "Önbelleğe alma başarısız!";
    console.error("Hata:", error);
  }
});

// Önbellekten bir dosya getir
fetchButton.addEventListener("click", async () => {
  const cache = await caches.open(CACHE_NAME);
  const url = "https://jsonplaceholder.typicode.com/posts/1"; // Getirilecek URL

  const cachedResponse = await cache.match(url); // Önbellekten eşleşme bul
  if (cachedResponse) {
    const data = await cachedResponse.json(); // JSON formatında çöz
    output.textContent = "Önbellekten gelen veri: " + JSON.stringify(data);
    console.log("Önbellekten gelen veri:", data);
  } else {
    output.textContent = "Önbellekte veri bulunamadı!";
    console.log("Önbellekte veri bulunamadı.");
  }
});

// Önbelleği temizle
clearButton.addEventListener("click", async () => {
  try {
    await caches.delete(CACHE_NAME);
    output.textContent = "Önbellek başarıyla temizlendi!";
    console.log("Önbellek temizlendi");
  } catch (error) {
    output.textContent = "Önbellek temizleme başarısız!";
    console.error("Önbellek temizleme hatası:", error);
  }
});
