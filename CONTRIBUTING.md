# 貢獻指南

感謝您有興趣為農業水資源智慧決策支援系統做出貢獻！本文件將說明如何參與專案開發。

## 開發流程

### 1. Fork 專案

首先，請 Fork 本專案到您的 GitHub 帳號。

### 2. 克隆專案

```bash
git clone https://github.com/YOUR_USERNAME/Smart-Irrigation-DSS.git
cd Smart-Irrigation-DSS
```

### 3. 建立分支

請從 `main` 分支建立新的功能分支：

```bash
git checkout -b feature/your-feature-name
```

分支命名規範：
- `feature/` - 新功能
- `fix/` - 錯誤修復
- `docs/` - 文件更新
- `refactor/` - 程式碼重構

### 4. 開發與測試

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 執行測試
pnpm test

# 型別檢查
pnpm check
```

### 5. 提交變更

請遵循 Conventional Commits 規範：

```bash
git commit -m "feat: 新增水庫歷史趨勢圖表"
git commit -m "fix: 修復 API 連線逾時問題"
git commit -m "docs: 更新 README 安裝說明"
```

提交類型：
- `feat` - 新功能
- `fix` - 錯誤修復
- `docs` - 文件變更
- `style` - 程式碼格式調整
- `refactor` - 程式碼重構
- `test` - 測試相關
- `chore` - 建置或輔助工具變更

### 6. 推送分支

```bash
git push origin feature/your-feature-name
```

### 7. 建立 Pull Request

在 GitHub 上建立 Pull Request，並填寫以下資訊：
- 變更說明
- 相關 Issue 編號
- 測試結果截圖（如適用）

## 程式碼規範

### TypeScript

- 使用 TypeScript 嚴格模式
- 所有函式必須有明確的型別標註
- 避免使用 `any` 型別

### React

- 使用函式元件與 Hooks
- 元件檔案使用 PascalCase 命名
- 將可重用邏輯抽取為自訂 Hook

### CSS

- 使用 Tailwind CSS 原子類別
- 避免內聯樣式
- 遵循 Mobile First 原則

### 測試

- 所有新功能必須包含測試
- 測試檔案放置於同目錄，命名為 `*.test.ts`
- 使用 Vitest 作為測試框架

## Issue 回報

回報 Issue 時，請提供以下資訊：

1. **問題描述**：清楚說明遇到的問題
2. **重現步驟**：詳細列出重現問題的步驟
3. **預期行為**：說明預期應該發生的情況
4. **實際行為**：說明實際發生的情況
5. **環境資訊**：瀏覽器版本、作業系統等

## 聯絡方式

如有任何問題，請透過以下方式聯繫：

- GitHub Issues
- Email: jefflee@yucloud.com.tw

再次感謝您的貢獻！
