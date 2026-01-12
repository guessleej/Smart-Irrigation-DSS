# 農業水資源智慧決策支援系統

**Agricultural Water Resource Decision Support System (Smart-Irrigation-DSS)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)

## 專案簡介

本系統為農業部農田水利署開發之智慧灌溉決策支援平台，整合多元水資源與氣象資料，提供視覺化分析與風險評估功能，協助灌溉管理者做出最佳決策。

### 主要功能

| 功能模組 | 說明 |
|---------|------|
| **水庫即時監測** | 串接水利署開放資料平台 API，即時顯示全台 68 座水庫水情資料 |
| **翡翠水庫專線** | 整合台北翡翠水庫管理局專線 API，提供即時水位與蓄水量 |
| **氣象資料整合** | 串接農業氣象觀測網 API，提供降雨情勢分析 |
| **缺水風險評估** | 結合水資源供需模擬，評估灌溉缺水風險等級 |
| **動態配水模擬** | 以桃園湖口工作站為例，模擬不同情境下的配水方案 |
| **決策儀表板** | 整合即時水情、降雨情勢、水庫豐枯分析於單一介面 |
| **3D GIS 視覺化** | 地圖互動展示灌溉系統設施與管理資訊 |
| **灌區管理** | 管理灌區基本資料、設施清單與作物資訊 |

## 技術架構

### 前端技術
- **React 19** - 使用者介面框架
- **TypeScript 5** - 型別安全的 JavaScript
- **Tailwind CSS 4** - 原子化 CSS 框架
- **shadcn/ui** - 現代化 UI 元件庫
- **Recharts** - 資料視覺化圖表
- **Wouter** - 輕量級路由管理

### 後端技術
- **Node.js 22** - JavaScript 執行環境
- **Express 4** - Web 應用框架
- **tRPC 11** - 端對端型別安全 API
- **Drizzle ORM** - TypeScript ORM
- **MySQL/TiDB** - 關聯式資料庫

### 外部 API 整合
- **水利署開放資料平台** (opendata.wra.gov.tw)
  - 水庫每日營運狀況
  - 水庫即時水情資料
  - 曾文、石門、翡翠等主要水庫專線
- **翡翠水庫管理局** (w3.feitsui.gov.tw)
  - 翡翠水庫即時水情專線 API
- **農業氣象觀測網** (weather.moa.gov.tw)
  - 農業氣象站資料
  - 雨量站即時資料

## 快速開始

### 環境需求
- Node.js 22.x 或更高版本
- pnpm 10.x 或更高版本
- MySQL 8.0 或 TiDB

### 安裝步驟

```bash
# 1. 克隆專案
git clone https://github.com/guessleej/Smart-Irrigation-DSS.git
cd Smart-Irrigation-DSS

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 檔案，填入資料庫連線資訊

# 4. 執行資料庫遷移
pnpm db:push

# 5. 啟動開發伺服器
pnpm dev
```

### 環境變數說明

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `DATABASE_URL` | MySQL/TiDB 連線字串 | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | JWT 簽章金鑰 | `your-secret-key` |
| `WRA_API_KEY` | 水利署 API 金鑰（選用） | `your-api-key` |

## 專案結構

```
Smart-Irrigation-DSS/
├── client/                 # 前端程式碼
│   ├── src/
│   │   ├── components/     # 共用元件
│   │   ├── pages/          # 頁面元件
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # 自訂 Hooks
│   │   └── lib/            # 工具函式
│   └── public/             # 靜態資源
├── server/                 # 後端程式碼
│   ├── services/           # API 介接服務
│   ├── routers.ts          # tRPC 路由定義
│   └── db.ts               # 資料庫查詢
├── drizzle/                # 資料庫 Schema
├── shared/                 # 共用型別與常數
└── docs/                   # 專案文件
```

## API 端點

### Dashboard
- `GET /api/trpc/dashboard.getStats` - 取得統計資料
- `GET /api/trpc/dashboard.getOverview` - 取得總覽資訊

### 水庫監測
- `GET /api/trpc/reservoir.list` - 取得水庫清單
- `GET /api/trpc/reservoir.getRealtimeData` - 取得即時水情資料
- `GET /api/trpc/reservoir.getMajorReservoirs` - 取得主要水庫資料
- `GET /api/trpc/reservoir.getFeitsuiRealtime` - 取得翡翠水庫即時資料

### 風險評估
- `GET /api/trpc/riskAssessment.getLatest` - 取得最新風險評估
- `GET /api/trpc/riskAssessment.getHistory` - 取得歷史評估記錄

### 配水模擬
- `POST /api/trpc/waterAllocation.runSimulation` - 執行配水模擬

## 測試

```bash
# 執行所有測試
pnpm test

# 執行測試並產生覆蓋率報告
pnpm test --coverage
```

目前測試覆蓋：
- API 整合測試：17 個測試案例
- 功能測試：18 個測試案例
- 認證測試：1 個測試案例
- **總計：36 個測試全部通過**

## 部署

### 建置生產版本

```bash
# 建置前端與後端
pnpm build

# 啟動生產伺服器
pnpm start
```

### Docker 部署

```bash
# 建置 Docker 映像
docker build -t smart-irrigation-dss .

# 執行容器
docker run -p 3000:3000 smart-irrigation-dss
```

## 貢獻指南

歡迎提交 Issue 與 Pull Request！請參閱 [CONTRIBUTING.md](CONTRIBUTING.md) 了解詳細的貢獻流程。

## 授權條款

本專案採用 MIT 授權條款，詳見 [LICENSE](LICENSE) 檔案。

## 聯絡資訊

- **開發團隊**：云昱科技
- **專案負責人**：JeffLee
- **Email**：jefflee@yucloud.com.tw

## 致謝

感謝以下單位提供資料與技術支援：
- 農業部農田水利署
- 經濟部水利署
- 台北翡翠水庫管理局
- 農業部農業氣象觀測網

---

© 2024-2026 農業部農田水利署. All Rights Reserved.
