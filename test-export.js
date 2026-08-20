(async () => {
  const { default: puppeteer } = await import('puppeteer');
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console logs from the page
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', error => {
    console.log(`[BROWSER PAGE ERROR]: ${error.message}`);
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Add some messages to the chat to enable export
  console.log('Adding test messages...');
  // Find "Add message" button in Messages Section and click it. Wait, the section needs to be expanded.
  // Instead of clicking UI, let's just trigger the export button directly if we can, or click through the UI.
  // Let's use evaluate to inject messages directly into Zustand store, or we can just click "Add message"
  
  await page.evaluate(() => {
    // Attempt to access useChatStore if it's attached to window (it's not by default).
    // Let's just click the UI elements.
    const buttons = Array.from(document.querySelectorAll('button'));
    const msgSectionBtn = buttons.find(b => b.textContent.includes('Messages'));
    if (msgSectionBtn) msgSectionBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addMsgBtn = buttons.find(b => b.textContent.includes('Add message'));
    if (addMsgBtn) {
      addMsgBtn.click();
      addMsgBtn.click(); // Add 2 messages
    }
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('Clicking Export section...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const exportSectionBtn = buttons.find(b => b.textContent.includes('Export'));
    if (exportSectionBtn) exportSectionBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('Clicking Export Video button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const exportBtn = buttons.find(b => b.textContent.includes('Export Video'));
    if (exportBtn) exportBtn.click();
  });

  console.log('Waiting for export to finish...');
  await new Promise(r => setTimeout(r, 10000));
  
  await browser.close();
  console.log('Done.');
})();
