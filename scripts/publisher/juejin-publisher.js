import { BasePublisher } from './base-publisher.js';

export class JuejinPublisher extends BasePublisher {
  async publish() {
    console.log('🚀 开始发布到掘金...');
    const page = await this.createPage();
    
    try {
        // 1. 打开编辑器
        await page.goto('https://juejin.cn/editor/drafts/new', { waitUntil: 'networkidle2' });

        // 2. 检查登录
        // 使用多重检测策略：头像、用户菜单、或 Cookie
        await this.waitForLogin([
            '.avatar', 
            '.user-avatar', 
            'img[src*="avatar"]', 
            '.user-dropdown', 
            '.nav-item.auth',
            '.username',
            '.user-menu'
        ], 'sessionid');

        // 3. 填写标题
        console.log('📝 正在填写标题...');
        await page.waitForSelector('.title-input');
        // 清空原有标题（如果是草稿）
        await page.evaluate(() => document.querySelector('.title-input').value = '');
        await this.typeContent('.title-input', this.article.title);

        // 4. 填写内容
        console.log('📝 正在填写内容...');
        await page.waitForSelector('.bytemd-editor');
        
        // 尝试聚焦到编辑器内部的具体可编辑区域
        // 掘金编辑器基于 CodeMirror，核心输入区通常是 .CodeMirror-scroll 或 .cm-content
        const editorSelector = '.CodeMirror-scroll, .bytemd-editor .cm-content, .bytemd-editor textarea';
        try {
            await page.waitForSelector(editorSelector, { timeout: 5000 });
            await page.click(editorSelector);
        } catch (e) {
            console.log('⚠️ 未找到精确的编辑器区域，尝试点击主容器...');
            await page.click('.bytemd-editor');
        }
        
        // 等待焦点切换
        await new Promise(r => setTimeout(r, 500));
        
        // 尝试使用 execCommand 插入文本 (最可靠的方式)
        const success = await page.evaluate((text) => {
            // 确保有焦点
            const active = document.activeElement;
            if (!active || active === document.body) {
                // 尝试找到编辑器内的 textarea 并强制聚焦
                const editorInput = document.querySelector('.CodeMirror textarea') || 
                                  document.querySelector('.bytemd-editor textarea') ||
                                  document.querySelector('[contenteditable="true"]');
                if (editorInput) editorInput.focus();
            }
            // 执行插入
            return document.execCommand('insertText', false, text);
        }, this.article.markdown);
        
        if (success) {
            console.log('✅ 内容已通过 execCommand 插入');
        } else {
            console.log('⚠️ execCommand 失败，尝试回退到剪贴板粘贴...');
            try {
                await page.evaluate((text) => {
                    navigator.clipboard.writeText(text);
                }, this.article.markdown);
                
                await new Promise(r => setTimeout(r, 500));
                
                const isMac = process.platform === 'darwin';
                const modifier = isMac ? 'Meta' : 'Control';
                await page.keyboard.down(modifier);
                await page.keyboard.press('V');
                await page.keyboard.up(modifier);
                console.log('✅ 内容已通过剪贴板粘贴');
            } catch (e) {
                console.error('❌ 内容填充彻底失败:', e);
            }
        }

        console.log('✅ 内容填充完成');
        
        // 增加等待逻辑，确保图片转存完成
        console.log('⏳ 等待图片转存和预览加载 (5秒)...');
        await new Promise(r => setTimeout(r, 5000));
        
        // 模拟滚动到底部，触发懒加载
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            const editor = document.querySelector('.bytemd-preview');
            if (editor) editor.scrollTop = editor.scrollHeight;
        });
        await new Promise(r => setTimeout(r, 2000));

        // 5. 准备发布
        console.log('👆 正在打开发布面板...');
        // 查找发布按钮，包含文本 "发布"
        // Puppeteer v23+ 移除了 $x，使用 xpath 前缀
        const publishBtn = await page.$$("xpath///button[contains(., '发布')]");
        
        if (publishBtn.length > 0) {
            await publishBtn[0].click();
        } else {
            console.log('⚠️ 未找到发布按钮，请手动点击');
        }

        console.log('🎉 掘金页面已就绪！请手动选择分类/标签并确认发布。');
        
        return { status: 'manual_check', platform: '掘金' };
    } catch (error) {
        console.error('❌ 掘金发布出错:', error);
        return { status: 'failed', platform: '掘金', error: error.message };
    }
  }
}
