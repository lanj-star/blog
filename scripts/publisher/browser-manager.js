import * as ChromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

export class BrowserManager {
  constructor(options = {}) {
    this.browser = null;
    this.chrome = null;
    this.isMock = options.mock || false;
  }

  async launch() {
    if (this.isMock) {
      console.log('🚧 [MOCK] 模拟启动浏览器...');
      this.browser = {
        newPage: async () => ({
          setViewport: async () => {},
          goto: async (url) => console.log(`[MOCK] 打开页面: ${url}`),
          waitForSelector: async (sel) => console.log(`[MOCK] 等待元素: ${sel}`),
          $: async (sel) => {
              // 模拟登录检测成功
              if (['.avatar', '.user-avatar'].includes(sel)) return {};
              return null;
          },
          $$: async (sel) => {
              if (sel.startsWith('xpath/')) {
                  return [{ click: async () => console.log(`[MOCK] 点击 XPath 元素: ${sel}`) }];
              }
              return [];
          },
          evaluate: async () => {},
          click: async (sel) => console.log(`[MOCK] 点击元素: ${sel}`),
          type: async (sel, text) => console.log(`[MOCK] 输入文本 "${text}" 到 ${sel}`),
          keyboard: {
            down: async () => {},
            press: async () => {},
            up: async () => {}
          },
          url: () => 'https://mock-url.com',
          waitForFunction: async () => {},
          cookies: async () => [],
          isClosed: () => false,
          close: async () => {}
        }),
        defaultBrowserContext: () => ({
            overridePermissions: async () => console.log('[MOCK] 覆盖权限')
        }),
        disconnect: async () => console.log('[MOCK] 断开连接')
      };
      return this.browser;
    }

    const homeDir = os.homedir();
    const userDataDir = path.join(homeDir, '.trae-blog-publisher/chrome-data');
    
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    console.log('🚀 正在启动自动化浏览器...');
    console.log(`📂 用户数据目录: ${userDataDir}`);

    try {
      // 尝试自动查找 Chrome
      const installations = ChromeLauncher.Launcher.getInstallations();
      if (installations.length === 0) {
          console.warn('⚠️ 未自动检测到 Chrome 安装路径，尝试使用默认配置启动...');
      } else {
          console.log(`✅ 检测到 Chrome 安装: ${installations.join(', ')}`);
      }

      this.chrome = await ChromeLauncher.launch({
        startingUrl: 'about:blank',
        userDataDir: userDataDir,
        chromeFlags: [
          '--window-size=1280,800', 
          '--disable-infobars',
          '--no-first-run',
          '--no-default-browser-check'
        ],
        ignoreDefaultFlags: true
      });

      console.log(`🔗 Chrome 端口: ${this.chrome.port}`);

      const response = await fetch(`http://127.0.0.1:${this.chrome.port}/json/version`);
      const data = await response.json();
      const { webSocketDebuggerUrl } = data;

      this.browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: null
      });

      return this.browser;
    } catch (error) {
      console.error('❌ 启动浏览器失败:', error);
      console.log('💡 建议：\n1. 确保已安装 Google Chrome。\n2. 尝试手动指定 Chrome 路径 (需要修改 browser-manager.js)。');
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.disconnect();
    }
    if (this.chrome) {
      this.chrome.kill();
    }
  }
}
