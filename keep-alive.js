const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Memulai Keep-Alive Stealth Browser...');
  
  try {
    const browser = await chromium.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'id-ID',
      timezoneId: 'Asia/Jakarta'
    });

    const page = await context.newPage();

    // Suntikkan properti anti-deteksi bot
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };
    });

    const url = 'https://hermes-agent.mark.blitz.cloud/';
    console.log(`🌐 Membuka: ${url}`);

    // Buka halaman dan tunggu sampai semua JS background selesai
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Simulasi manusia: scroll ke bawah sedikit
    await page.evaluate(() => window.scrollBy(0, 400));
    
    // Tunggu 2 detik agar server mencatat aktivitas
    await new Promise(r => setTimeout(r, 2000));

    console.log(`✅ Sukses! Status halaman: ${page.url()}`);
    await browser.close();
  } catch (error) {
    console.error('❌ Gagal:', error.message);
    process.exit(1); // Keluar dengan error agar GitHub Actions menandai sebagai "Failed"
  }
})();
