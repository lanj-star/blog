#!/usr/bin/env node

/**
 * 自动化发布流程 Mock 测试
 * 使用方法：node scripts/test-publish-mock.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserManager } from './publisher/browser-manager.js';
import { JuejinPublisher } from './publisher/juejin-publisher.js';
import { CSDNPublisher } from './publisher/csdn-publisher.js';
import { WechatPublisher } from './publisher/wechat-publisher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMockTest() {
  console.log('🧪 开始运行自动化发布流程 Mock 测试...');

  // 1. 模拟文章数据
  const mockArticle = {
    title: '测试文章标题',
    markdown: '# 测试文章\n\n这是测试内容。',
    tags: ['测试', '自动化']
  };

  console.log('📦 模拟文章数据:', mockArticle.title);

  // 2. 启动 Mock 浏览器
  const browserManager = new BrowserManager({ mock: true });
  let browser;

  try {
    browser = await browserManager.launch();
    console.log('✅ Mock 浏览器启动成功');
  } catch (e) {
    console.error('❌ Mock 浏览器启动失败:', e);
    process.exit(1);
  }

  // 3. 测试掘金发布流程
  try {
    console.log('\n--- 测试掘金发布器 ---');
    const juejinPublisher = new JuejinPublisher(browser, mockArticle);
    await juejinPublisher.publish();
    console.log('✅ 掘金发布流程测试通过');
  } catch (e) {
    console.error('❌ 掘金发布流程测试失败:', e);
  }

  // 4. 测试 CSDN 发布流程
  try {
    console.log('\n--- 测试 CSDN 发布器 ---');
    const csdnPublisher = new CSDNPublisher(browser, mockArticle);
    await csdnPublisher.publish();
    console.log('✅ CSDN 发布流程测试通过');
  } catch (e) {
    console.error('❌ CSDN 发布流程测试失败:', e);
  }

  // 5. 测试公众号发布流程
  try {
    console.log('\n--- 测试公众号发布器 ---');
    const wechatPublisher = new WechatPublisher(browser, mockArticle);
    await wechatPublisher.publish();
    console.log('✅ 公众号发布流程测试通过');
  } catch (e) {
    console.error('❌ 公众号发布流程测试失败:', e);
  }

  // 6. 清理
  await browserManager.close();
  console.log('\n✨ 所有 Mock 测试完成！');
}

runMockTest();
