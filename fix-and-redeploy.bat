@echo off
chcp 65001 >nul
echo ===============================================
echo   GitHub Pages 部署修复脚本
echo ===============================================
echo.

echo [1/3] 创建空提交触发部署...
git commit --allow-empty -m "Trigger GitHub Pages deployment"
echo.

echo [2/3] 推送到 GitHub...
git push origin main
echo.

echo [3/3] 完成！
echo.
echo ===============================================
echo   下一步操作：
echo ===============================================
echo.
echo 1. 访问 GitHub Pages 设置页面：
echo    https://github.com/lanj-star/blog/settings/pages
echo.
echo 2. 确保 Source 设置为：GitHub Actions
echo.
echo 3. 访问 Actions 页面查看构建状态：
echo    https://github.com/lanj-star/blog/actions
echo.
echo 4. 等待构建完成后访问你的博客：
echo    https://lanj-star.github.io/blog/
echo.
echo ===============================================
pause
