/**
 * @jest-environment jsdom
 */

describe("Cache API Tests", () => {
  let mockCache;

  beforeEach(() => {
    // DOM elementlerini oluştur
    document.body.innerHTML = `
      <button id="cache-data">Veriyi Önbelleğe Al</button>
      <button id="fetch-data">Önbellekten Veriyi Getir</button>
      <button id="clear-cache">Önbelleği Temizle</button>
      <div id="output"></div>
    `;

    // Cache API mock
    mockCache = {
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn(),
    };

    global.caches = {
      open: jest.fn().mockResolvedValue(mockCache),
      delete: jest.fn().mockResolvedValue(true),
    };

    // Fetch API mock
    global.fetch = jest.fn().mockResolvedValue({
      clone: () => ({
        json: () => Promise.resolve({ id: 1, title: "Test Post" }),
      }),
      json: () => Promise.resolve({ id: 1, title: "Test Post" }),
    });

    // script.js'i yükle
    jest.isolateModules(() => {
      require("./script.js");
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  test("Veriyi önbelleğe alma işlemi başarılı olmalı", async () => {
    const cacheButton = document.getElementById("cache-data");
    const output = document.getElementById("output");

    // Event'i tetikle
    cacheButton.dispatchEvent(new MouseEvent("click"));

    // Async işlemlerin tamamlanmasını bekle
    await new Promise(process.nextTick);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    expect(mockCache.put).toHaveBeenCalled();
    expect(output.textContent).toBe("Veri önbelleğe alındı!");
  });

  test("Önbellekten veri getirme işlemi başarılı olmalı", async () => {
    const fetchButton = document.getElementById("fetch-data");
    const output = document.getElementById("output");

    mockCache.match.mockResolvedValue({
      json: () => Promise.resolve({ id: 1, title: "Test Post" }),
    });

    // Event'i tetikle
    fetchButton.dispatchEvent(new MouseEvent("click"));

    // Async işlemlerin tamamlanmasını bekle
    await new Promise(process.nextTick);

    expect(mockCache.match).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    expect(output.textContent).toContain("Önbellekten gelen veri:");
  });

  test("Önbellekte veri yoksa uygun mesaj gösterilmeli", async () => {
    const fetchButton = document.getElementById("fetch-data");
    const output = document.getElementById("output");

    mockCache.match.mockResolvedValue(null);

    // Event'i tetikle
    fetchButton.dispatchEvent(new MouseEvent("click"));

    // Async işlemlerin tamamlanmasını bekle
    await new Promise(process.nextTick);

    expect(output.textContent).toBe("Önbellekte veri bulunamadı!");
  });

  test("Önbellek temizleme işlemi başarılı olmalı", async () => {
    const clearButton = document.getElementById("clear-cache");
    const output = document.getElementById("output");

    // Event'i tetikle
    clearButton.dispatchEvent(new MouseEvent("click"));

    // Async işlemlerin tamamlanmasını bekle
    await new Promise(process.nextTick);

    expect(global.caches.delete).toHaveBeenCalledWith("my-cache-v1");
    expect(output.textContent).toBe("Önbellek başarıyla temizlendi!");
  });

  test("Önbellek temizleme işlemi başarısız olduğunda hata mesajı gösterilmeli", async () => {
    const clearButton = document.getElementById("clear-cache");
    const output = document.getElementById("output");

    global.caches.delete.mockRejectedValue(new Error("Silme hatası"));

    // Event'i tetikle
    clearButton.dispatchEvent(new MouseEvent("click"));

    // Async işlemlerin tamamlanmasını bekle
    await new Promise(process.nextTick);

    expect(output.textContent).toBe("Önbellek temizleme başarısız!");
  });
});
