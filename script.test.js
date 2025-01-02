/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Cache API Tests", () => {
  let mockCache;

  beforeEach(() => {
    // index.html dosyasını yükle
    const html = fs.readFileSync(
      path.resolve(__dirname, "./index.html"),
      "utf8"
    );
    document.documentElement.innerHTML = html;

    // Cache API mock
    mockCache = {
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn(),
    };

    global.caches = {
      open: jest.fn().mockResolvedValue(mockCache),
      delete: jest.fn().mockResolvedValue(true),
    };

    // navigator.onLine mock
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });

    // Fetch API mock
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === "https://jsonplaceholder.typicode.com") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        clone: () => ({
          json: () => Promise.resolve({ id: 1, title: "Test Post" }),
        }),
        json: () => Promise.resolve({ id: 1, title: "Test Post" }),
      });
    });

    // script.js'i yükle
    jest.isolateModules(() => {
      require("./script.js");
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.innerHTML = "";
  });

  test("İnternet bağlantısı varken veri API'den alınmalı", async () => {
    const fetchButton = document.getElementById("fetch-data");
    const output = document.getElementById("output");

    await fetchButton.click();

    // Bağlantı kontrolü için bekle
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(global.fetch).toHaveBeenCalledTimes(2); // Bir kez bağlantı kontrolü, bir kez veri için
    expect(mockCache.put).toHaveBeenCalled();
    expect(output.textContent).toContain("Veri API'den alındı");
  });

  test("İnternet bağlantısı yokken cache'den veri alınmalı", async () => {
    const fetchButton = document.getElementById("fetch-data");
    const output = document.getElementById("output");

    // İnternet bağlantısını kapat
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    // Cache'de veri olduğunu simüle et
    mockCache.match.mockResolvedValue({
      json: () => Promise.resolve({ id: 1, title: "Cached Post" }),
    });

    await fetchButton.click();

    // Async işlemlerin tamamlanmasını bekle
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(output.textContent).toContain("İnternet bağlantısı yok");
    expect(output.textContent).toContain("önbellekten alındı");
  });

  test("İnternet ve cache yokken hata mesajı gösterilmeli", async () => {
    const fetchButton = document.getElementById("fetch-data");
    const output = document.getElementById("output");

    // İnternet bağlantısını kapat
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    // Cache'in boş olduğunu simüle et
    mockCache.match.mockResolvedValue(null);

    await fetchButton.click();

    // Async işlemlerin tamamlanmasını bekle
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(output.textContent).toBe(
      "Veri alınamadı! İnternet bağlantısı yok ve önbellekte veri bulunamadı."
    );
  });

  test("Önbellek temizleme işlemi başarılı olmalı", async () => {
    const clearButton = document.getElementById("clear-cache");
    const output = document.getElementById("output");

    await clearButton.click();

    expect(global.caches.delete).toHaveBeenCalledWith("my-cache-v1");
    expect(output.textContent).toBe("Önbellekteki veri başarıyla silindi!");
  });

  test("Önbellek temizleme işlemi başarısız olduğunda hata mesajı gösterilmeli", async () => {
    const clearButton = document.getElementById("clear-cache");
    const output = document.getElementById("output");

    // Silme işleminin başarısız olduğunu simüle et
    global.caches.delete.mockRejectedValue(new Error("Silme hatası"));

    await clearButton.click();

    expect(output.textContent).toBe("Önbellekteki veri silinemedi!");
  });
});
