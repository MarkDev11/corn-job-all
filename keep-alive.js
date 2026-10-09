const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Memulai Keep-Alive Stealth Browser (Bulletproof Mode)...');
  
  const url = 'https://hermes-agent.mark.blitz.cloud/';
  let attempts = 0;
  const maxAttempts = 3; // Akan mencoba maksimal 3 kali jika gagal
  
  while (attempts < maxAttempts) {
    attempts++;
    let browser;
    
    try {
      console.log(`\n🔄 Percobaan ke-${attempts}...`);
      
      browser = await chromium.launch({
        headless: true,
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

      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        window.chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };
      });

      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => window.scrollBy(0, 400));
      await new Promise(r => setTimeout(r, 2000));

      console.log(`✅ SUKSES di percobaan ke-${attempts}! Status: ${page.url()}`);
      await browser.close();
      
      // Jika berhasil, hentikan loop (break)
      process.exit(0); 
      
    } catch (error) {
      console.error(`❌ Percobaan ke-${attempts} Gagal: ${error.message}`);
      if (browser) await browser.close();
      
      if (attempts < maxAttempts) {
        console.log('⏳ Menunggu 5 detik sebelum mencoba lagi...');
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error('💀 Semua percobaan gagal. Workflow akan ditandai sebagai Failed.');
        process.exit(1);
      }
    }
  }
})();
