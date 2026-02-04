import { BasePublisher } from './base-publisher.js';

export class CSDNPublisher extends BasePublisher {
  async publish() {
    console.log('🚀 开始发布到 CSDN...');
    const page = await this.createPage();
    
    try {
        await page.goto('https://editor.csdn.net/md/', { waitUntil: 'networkidle2' });

        // 检查登录
        if (page.url().includes('passport.csdn.net')) {
            console.log('⚠️ 检测到登录页面，请手动登录...');
            // 等待直到 URL 变回编辑器
            await page.waitForFunction(() => location.href.includes('editor.csdn.net'), { timeout: 0 });
            console.log('✅ 登录成功');
        }

        console.log('📝 正在填写标题...');
        await page.waitForSelector('.article-bar__title');
        // 清空
        await page.evaluate(() => document.querySelector('.article-bar__title').value = '');
        await this.typeContent('.article-bar__title', this.article.title);

        console.log('📝 正在填写内容...');
        // CSDN 编辑器区域
        await page.click('pre'); // 点击代码区域
        
        // 剪贴板粘贴策略
        await page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, this.article.markdown);
        
        await new Promise(r => setTimeout(r, 1000));
        const isMac = process.platform === 'darwin';
        const modifier = isMac ? 'Meta' : 'Control';
        await page.keyboard.down(modifier);
        await page.keyboard.press('V');
        await page.keyboard.up(modifier);

        console.log('✅ 内容填充完成');
        
        console.log('👆 点击发布按钮...');
        await page.click('.btn-publish');

        console.log('🎉 CSDN 页面已就绪！请手动完善分类并发布。');
        return { status: 'manual_check', platform: 'CSDN' };

    } catch (error) {
        console.error('❌ CSDN 发布出错:', error);
        return { status: 'failed', platform: 'CSDN', error: error.message };
    }
  }
}
