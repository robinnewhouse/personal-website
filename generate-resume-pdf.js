const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8787;
const ROOT = __dirname;
const OUTPUT = path.join(ROOT, 'assets', 'documents', 'Robin Newhouse - Resume.pdf');

// Simple static file server
function startServer() {
  const mimeTypes = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  };

  const server = http.createServer((req, res) => {
    const filePath = path.join(ROOT, decodeURIComponent(req.url === '/' ? '/index.html' : req.url));
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise(resolve => server.listen(PORT, () => resolve(server)));
}

async function main() {
  const server = await startServer();
  console.log(`Server running on port ${PORT}`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Use a wide viewport matching the resume's min-width
  await page.setViewport({ width: 1100, height: 1400 });

  // Render as screen media so print @media rules don't interfere
  await page.emulateMediaType('screen');

  await page.goto(`http://localhost:${PORT}/resume.html`, { waitUntil: 'networkidle0' });

  // Hide navbar and download button for the PDF
  await page.evaluate(() => {
    document.getElementById('navbar-placeholder')?.remove();
    document.querySelector('.download-button')?.remove();
    document.body.classList.remove('resume-page');
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    // Force all text to true black for PDF
    const style = document.createElement('style');
    style.textContent = `
      body, h1, h2, h3, h4, p, span, div, li {
        color: #000 !important;
      }
    `;
    document.head.appendChild(style);
  });

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  // Scale: letter content width (~196mm) needs to fit 1100px viewport
  // At 96dpi: 196mm ≈ 740px, so scale = 740/1100 ≈ 0.67
  await page.pdf({
    path: OUTPUT,
    format: 'Letter',
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    printBackground: true,
    scale: 0.68,
  });

  console.log(`PDF saved to: ${OUTPUT}`);

  await browser.close();
  server.close();
}

main().catch(err => { console.error(err); process.exit(1); });
