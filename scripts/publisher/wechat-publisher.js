import { BasePublisher } from './base-publisher.js';

export class WechatPublisher extends BasePublisher {
  async publish() {
    console.log('🚀 开始发布到公众号...');
    const page = await this.createPage();
    
    try {
        await page.goto('https://mp.weixin.qq.com/', { waitUntil: 'networkidle2' });

        // 检查登录
        await this.waitForLogin('.weui-desktop-account__name');

        console.log('⚠️ 微信后台结构复杂，请手动点击 "草稿箱" -> "新的创作" -> "写新图文"');
        console.log('⏳ 等待编辑器加载...');
        
        // 等待用户打开编辑器
        // 微信编辑器通常在一个新页面或 iframe 中
        // 我们一直轮询直到发现编辑器特征
        await page.waitForFunction(() => {
            // 检测是否进入了图文编辑页
            return location.href.includes('appmsg/index') || document.querySelector('#ueditor_0');
        }, { timeout: 0 });
        
        console.log('✅ 编辑器页面已就绪');
        
        // 生成 HTML
        const html = this.convertMarkdownToWechatHtml(this.article.markdown);
        
        // 写入剪贴板
        await page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, html);
        
        console.log('📋 HTML 内容已复制到剪贴板');
        console.log('👉 请在正文区域点击并按 Ctrl+V / Cmd+V 粘贴');
        console.log('📝 另外请记得手动填写标题和封面图');
        
        return { status: 'manual_action_required', platform: '微信公众号' };

    } catch (error) {
        console.error('❌ 公众号操作出错:', error);
        return { status: 'failed', platform: '微信公众号', error: error.message };
    }
  }
  
  convertMarkdownToWechatHtml(markdown) {
      // 简单的 Markdown 转 HTML
      let html = markdown
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\n/gim, '<br>');
        
      return `
        <section style="font-size: 16px; color: #333; line-height: 1.8;">
            ${html}
        </section>
      `;
  }
}
