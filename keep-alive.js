const { chromium } = require('playwright');

// ==========================================
// 📝 DAFTAR WEBSITE YANG INGIN DI-KEEP ALIVE
// Tambahkan URL baru di dalam array ini
// ==========================================
const WEBSITES = [
  'https://hermes-agent.mark.blitz.cloud/',
  'https://fayln-api.marky.blitz.cloud/',
  // Tambahkan website lain di bawah ini, contoh:
  // 'https://website-ketiga.com/',
  // 'https://website-keempat.com/',
];

(async () => {
  console.log(`🚀 Memulai Keep-Alive untuk ${WEBSITES.length} website...`);
  
  let browser;
  
  try {
    // Luncurkan browser HANYA SEKALI untuk semua website (lebih hemat resource)
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    // Loop melalui setiap website
    for (let i = 0; i < WEBSITES.length; i++) {
      const url = WEBSITES[i];
      console.log(`\n========================================`);
      console.log(`🌐 [${i + 1}/${WEBSITES.length}] Membuka: ${url}`);
      
      let attempts = 0;
      const maxAttempts = 3; // Retry 3x per website
      let success = false;
      
      while (attempts < maxAttempts && !success) {
        attempts++;
        let context;
        
        try {
          console.log(`🔄 Percobaan ke-${attempts} untuk ${url}...`);
          
          // Buat Context (Tab/Session) BARU untuk setiap website 
          // agar cookies dan cache tidak benturan satu sama lain
          context = await browser.newContext({
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

          await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          await page.evaluate(() => window.scrollBy(0, 400));
          await new Promise(r => setTimeout(r, 2000));

          console.log(`✅ SUKSES! Status: ${page.url()}`);
          success = true; // Tandai berhasil
          
          await context.close(); // Tutup tab/session setelah selesai
          
        } catch (error) {
          console.error(`❌ Gagal di percobaan ke-${attempts}: ${error.message}`);
          if (context) await context.close();
          
          if (attempts < maxAttempts) {
            console.log('⏳ Menunggu 5 detik sebelum mencoba lagi...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
      
      if (!success) {
        console.error(`💀 Website ${url} gagal diakses setelah ${maxAttempts} percobaan.`);
        // Kita TIDAK menggunakan process.exit(1) di sini agar loop tetap lanjut ke website berikutnya
      }
    }
    
    console.log(`\n========================================`);
    console.log(`🏁 Semua proses selesai!`);
    await browser.close();
    
  } catch (fatalError) {
    console.error('❌ Fatal Error (Browser gagal diluncurkan):', fatalError.message);
    if (browser) await browser.close();
    process.exit(1); // Exit 1 jika browser utama gagal total
  }
})();
