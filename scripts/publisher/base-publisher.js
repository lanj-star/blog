export class BasePublisher {
  constructor(browser, article) {
    this.browser = browser;
    this.article = article;
    this.page = null;
  }

  async publish() {
    throw new Error('publish() method must be implemented');
  }

  async createPage() {
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
    return this.page;
  }

  async typeContent(selector, content) {
    await this.page.type(selector, content, { delay: 50 });
  }
  
  async setContentByValue(selector, content) {
      await this.page.evaluate((sel, text) => {
          const el = document.querySelector(sel);
          if (el) {
              el.value = text;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
          }
      }, selector, content);
  }

  async waitForLogin(selectorOrSelectors, cookieName = null) {
    const selectors = Array.isArray(selectorOrSelectors) ? selectorOrSelectors : [selectorOrSelectors];
    console.log('⏳ 正在检测登录状态...');
    
    let attempts = 0;
    const maxAttempts = 120; // 2分钟超时，避免无限死循环

    while (attempts < maxAttempts) {
        if (this.page.isClosed()) {
            throw new Error('页面已关闭，停止检测登录');
        }

        // 1. 检测选择器
        for (const selector of selectors) {
            try {
                // 使用 $ 而不是 waitForSelector，避免阻塞
                const element = await this.page.$(selector);
                // 确保元素不仅存在，而且可见（可选）
                if (element) {
                    console.log(`✅ 检测到登录成功 (匹配元素: ${selector})`);
                    return true;
                }
            } catch (e) {
                // 忽略选择器错误
            }
        }

        // 2. 检测 Cookie
        if (cookieName) {
            try {
                const cookies = await this.page.cookies();
                const hasCookie = cookies.some(c => c.name === cookieName);
                if (hasCookie) {
                     console.log(`✅ 检测到登录成功 (匹配 Cookie: ${cookieName})`);
                     return true;
                }
            } catch (e) {}
        }

        attempts++;
        await new Promise(r => setTimeout(r, 1000));
        
        if (attempts % 10 === 0) {
            console.log(`⚠️ 未检测到登录状态，请在浏览器中手动登录... (${attempts}/${maxAttempts})`);
        }
    }

    console.warn('⚠️ 登录检测超时！假设您已登录，尝试强制继续执行...');
    return true;
  }
}
