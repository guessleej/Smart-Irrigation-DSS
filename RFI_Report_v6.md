# 財政部財政資訊中心

## 「智慧算力共用平臺建置委外服務案」

### 公開徵求資訊 (Request for Information, RFI) 回覆說明文件

**提案廠商：云碩科技 (xCloudinfo Group)**

**文件版本：6.0**

**日期：2026 年 2 月 13 日**

---

## 摘要

本文件旨在回應財政部財政資訊中心（以下簡稱「貴中心」）針對「智慧算力共用平臺建置委外服務案」所提出之公開徵求資訊 (RFI)。云碩科技（xCloudinfo Group）深刻理解本專案不僅是為了解決當前生成式人工智慧 (Generative AI) 應用所需之算力缺口，更是為貴中心未來十年 AI 發展藍圖奠定堅實、安全且具前瞻性的數位基礎設施。面對高效能算力需求、封閉式地端環境的嚴苛資安要求、以及資源統籌管理的複雜性，本文件提出一套全棧式 (Full-Stack)、端到端的 AI 平台解決方案。

本方案以貴中心內部機房建置為首選，在完全符合機房功率、散熱、承重等限制條件下，規劃了以 **NVIDIA H200 NVL 141GB** 與 **RTX 6000 Pro Server Blackwell Edition 96GB** 混合配置的 GPU 運算叢集、**NetApp AFF A50 HA Pair** 全快閃儲存陣列（**80TB** 可用空間）、基於 **NVIDIA SN3700C / SN3420 Leaf-Spine** 架構的高效能網路，以及 **Palo Alto PA-5450** 防火牆與 **A10 Networks Thunder ADC** 組成的資安邊界防護。在軟體層面，我們提出以 **SEGMA 資源管理平台** 為核心的全新架構，此平台整合了先進的 GPU 虛擬化、多租戶管理、自動化調度與精細化監控能力，並內建與 OpenAI 相容的 **SEGMA API Gateway**，提供更強大、更統一的管理體驗。此外，本方案更創新性地導入 **8 台研華 MIC-743-AT 邊緣運算單元**，搭載 NVIDIA Jetson Thor 處理器，部署於各業務單位，作為本地知識庫引擎與邊緣推論節點，實現「中心算力 + 邊緣智慧」的雙層 AI 架構。

本文件將依循專業論文體例，從專案背景、系統架構、各子系統設計細節，到 CPU 與記憶體的精確配置、專案管理規劃與成本效益分析，進行全面且深入的闡述，以期完整呈現云碩科技對本專案的專業洞察與卓越執行能力。

---

## 目錄

- **第一章 緒論**
  - 1.1 研究背景與動機
  - 1.2 專案目標與核心挑戰
  - 1.3 方案範疇與文件結構
- **第二章 系統總體架構設計**
  - 2.1 設計原則
  - 2.2 四層式系統架構
  - 2.3 部署模式：內部機房建置方案
- **第三章 基礎設施層 (IaaS) 設計**
  - 3.1 運算子系統 (Compute Subsystem)
  - 3.2 儲存子系統 (Storage Subsystem)
  - 3.3 網路子系統 (Network Subsystem)
  - 3.4 資安邊界子系統 (Security Perimeter Subsystem)
  - 3.5 邊緣運算子系統 (Edge Computing Subsystem)
- **第四章 服務與管理層 (PaaS) 設計**
  - 4.1 SEGMA 資源管理平台總覽
  - 4.2 資源管理與智慧調度機制
  - 4.3 模型部署與 API 服務機制
  - 4.4 系統監控與可觀測性
  - 4.5 使用者、權限與叢集管理
- **第五章 專案管理與執行規劃**
  - 5.1 專案建置時程規劃
  - 5.2 預算成本估算
  - 5.3 風險評估與應對策略
- **第六章 結論與展望**
- **附錄 A：伺服器詳細配置表**
- **參考文獻**

---

## 第一章 緒論

### 1.1 研究背景與動機

隨著生成式人工智慧技術的飛速發展，大型語言模型 (LLM)、語音辨識 (ASR) 及檢索增強生成 (RAG) 等應用已成為推動政府數位轉型、提升公共服務品質的關鍵動能。財政部財政資訊中心作為國家財政數據中樞，肩負著處理大量機敏資料的重責大任，其 AI 應用的發展不僅追求效率，更需將資訊安全與資料自主性置於首位。然而，現有資訊環境普遍面臨 AI 算力不足、資源管理分散、以及缺乏符合 A 級機關資安規範的地端 AI 基礎設施等問題。為此，貴中心提出「智慧算力共用平臺建置委外服務案」，旨在建構一個高效、安全、可控的 AI 算力基礎設施 (IaaS)，以滿足日益增長的 AI 應用需求，並為未來的智慧財政創新奠定基石。

### 1.2 專案目標與核心挑戰

根據 RFI 文件內容，本專案的核心目標在於建置或租用一套高效能的智慧算力基礎設施，以整合並擴充其內網的生成式 AI 應用能力。我們將此目標解構成以下五大核心挑戰：

1. **高效能算力挑戰**：平台需提供足以支撐多種大型模型同時運作，並滿足嚴苛回應效率指標（TTFT < 5-10 秒，TPS > 20）的高強度 GPU 算力。
2. **極致安全挑戰**：由於涉及機敏資料，整體解決方案必須在與網際網路實體隔離的「封閉式地端」環境中部署，對廠商的資安建置、實體隔離與離線維運能力構成極高要求。
3. **精細化管理挑戰**：需建置一套功能完善的資源管理平台，具備資源池化、虛擬化切割 (vGPU)、自動化調度、多租戶權限控管及精細化監控報表等能力，以最大化資源利用率並簡化管理複雜度。
4. **部署彈性挑戰**：方案需考量於貴中心內部機房建置、外部機房租用，或直接租用算力服務等不同模式，考驗廠商整合不同部署模式與環境限制的能力。
5. **邊緣智慧挑戰**：各業務單位對於本地化知識庫與低延遲推論有迫切需求，如何在中心化算力平台之外，延伸 AI 能力至各單位端點，是本方案的創新挑戰。

### 1.3 方案範疇與文件結構

為完整回應上述挑戰，本文件將提出一套涵蓋硬體基礎設施、軟體平台服務、邊緣運算延伸、專案管理與後續維運的「全棧式 AI 平台解決方案」。文件結構安排如下：第二章闡述系統的總體架構與設計原則。第三章深入探討基礎設施層的各個子系統設計細節，包含運算、儲存、網路、資安邊界及邊緣運算。第四章說明服務管理層的軟體平台設計。第五章提出具體的專案執行時程、成本估算與風險管理策略。最後，第六章進行總結與展望。

---

## 第二章 系統總體架構設計

### 2.1 設計原則

本方案的架構設計遵循以下六大核心原則：

1. **安全優先 (Security-First)**：所有設計均以滿足 A 級機關的資安規範為最高前提，採用實體隔離、縱深防禦的策略，從資安邊界層的防火牆與 WAF 到內部網路的微分段，層層把關。
2. **效能導向 (Performance-Oriented)**：選用業界頂尖的硬體與軟體，針對 AI 工作負載進行優化，確保滿足 RFI 的效能指標。
3. **開放標準 (Open Standards)**：優先採用開源或相容開放標準的技術 (如 Kubernetes, OpenAI API)，避免廠商鎖定，提升系統的互通性與未來擴充性。
4. **自動化維運 (Automated Operations)**：透過軟體定義與自動化流程，簡化資源管理、模型部署與系統監控的複雜度，降低人力維運成本。
5. **模組化擴充 (Modular Scalability)**：採用模組化、可水平擴展的架構，確保未來無論是運算、儲存或網路資源，皆可獨立且平滑地進行擴充。
6. **中心與邊緣協同 (Center-Edge Synergy)**：創新性地結合中心機房的高效能算力與各單位部署的邊緣運算節點，實現「集中訓練、分散推論」的雙層智慧架構。

### 2.2 四層式系統架構

我們提出的「全棧式 AI 平台」採用分層但緊密整合的設計，由外至內、由上至下分為**資安邊界層、應用與開發層、服務與管理層、基礎設施層**四大核心層級，並延伸出**邊緣運算層**。此架構確保了各層級的獨立性與專業性，同時透過標準化的 API 進行高效協作。

**圖 2-1：智慧算力共用平臺總體架構圖 (v6.0)**

![智慧算力共用平臺總體架構圖](/home/ubuntu/architecture_diagram_v9.png)

如上圖所示，四層架構的職責劃分如下：

#### 2.2.1 資安邊界層 (Security Perimeter Layer)

資安邊界層是整體平台的第一道防線，部署於外部網路/內部網路與平台核心之間，採用**縱深防禦 (Defense in Depth)** 策略，由兩道關卡組成：

**第一道關卡：Palo Alto Networks PA-5450 防火牆 x2 (HA Pair)**。作為網路層的守門員，執行 L3/L4 封包過濾、入侵偵測與防禦 (IDS/IPS)、應用程式識別與控制等功能。兩台設備組成主動-被動 (Active-Passive) 高可用叢集，確保任一設備故障時服務不中斷。

**第二道關卡：A10 Networks Thunder ADC x2 (HA Pair)**。部署於防火牆之後，作為應用層的智慧閘道，負責以下關鍵功能：
- **URL 分流 (URL Routing)**：根據 API 請求的 URL 路徑，將流量智慧地導向不同的後端服務（如 LLM 推論、RAG 查詢、ASR 語音辨識等）。
- **WAF 保護 (Web Application Firewall)**：針對 OWASP Top 10 等常見 Web 攻擊提供即時防護，保護後端 API 服務免受 SQL Injection、XSS 等攻擊。
- **負載平衡 (Load Balancing)**：將 API 請求均勻分配至多台後端伺服器，確保服務的高可用性與最佳回應時間。
- **SSL/TLS 卸載 (SSL Offloading)**：在 ADC 層完成加解密運算，減輕後端伺服器的運算負擔。

#### 2.2.2 應用與開發層 (Application & Development Layer)

應用與開發層是平台的最終使用者介面，包含**專案開發者**與各式 **AI 應用服務**（如 RAG、ASR 等）。開發者透過平台核發的 **API Key** 存取平台提供的 AI 服務，所有 API 請求均經由資安邊界層的防火牆與 A10 ADC 進行安全過濾與智慧分流後，方可抵達後端的服務與管理層。

#### 2.2.3 服務與管理層 (Service & Management Layer)

服務與管理層為平台的大腦與中樞，負責資源的虛擬化、調度、管理、監控，並將底層硬體資源封裝成標準化的 AI 服務。此層以 **SEGMA 資源管理平台** 為核心，提供一站式的 GPU 資源管理解決方案。其主要元件與功能如下：
- **SEGMA 資源管理平台**：基於 Kubernetes 的雲原生架構，提供圖形化管理介面，實現 GPU 資源的池化、多租戶管理、vGPU 虛擬化切割、以及全自動化的智慧調度。平台支援多叢集管理，可統一納管地端與未來可能的雲端 GPU 資源。
- **SEGMA API Gateway**：平台內建的 API 閘道，完全相容 OpenAI API 標準。負責所有 AI 服務的 API Key 認證、請求路由、用量配額與速率限制管理，提供統一、安全的服務入口。
- **高效推論引擎 (Inference Engines)**：原生整合 **vLLM**、**SGLang**、**TensorRT-LLM** 等多種業界頂尖推論引擎，並可透過自訂後端功能進行擴充。平台會根據模型特性與效能需求，自動選擇最適合的引擎執行推論。
- **監控與告警平台 (Observability Stack)**：深度整合 **Grafana**、**Prometheus** 與 **Loki**，並透過 **NVIDIA DCGM Exporter** 蒐集詳細的 GPU 指標，提供從平台、叢集、節點到單張 GPU 的全維度監控儀表板與告警機制。
- **企業級向量資料庫 (Vector Database)**：整合 **Milvus** 與 **Weaviate**，提供高效能、可擴展的向量檢索服務，作為 RAG 應用的核心基礎。

#### 2.2.4 基礎設施層 (Infrastructure Layer)

基礎設施層作為平台的基石，提供所有硬體資源，由三大單元組成：
- **運算單元**：採用 **HPE ProLiant DL380a Gen12** 伺服器，搭載 **12 張 NVIDIA H200 NVL 141GB** 與 **6 張 NVIDIA RTX 6000 Pro Server Blackwell Edition 96GB** GPU，提供超越 RFI 要求的強大算力。每台伺服器配置 **NVIDIA ConnectX-7 200GbE** (GPU 高速互聯) 與 **ConnectX-6 Lx 25GbE** (管理/儲存) 雙網卡。
- **儲存單元**：採用 **NetApp AFF A50 HA Pair** 全快閃儲存陣列，提供 **80TB** 可用空間與微秒級超低延遲。
- **網路單元**：採用 **NVIDIA SN3700C x2** (Spine) 與 **NVIDIA SN3420 x3** (Leaf) 組成 Leaf-Spine 高效能網路架構。

#### 2.2.5 邊緣運算層 (Edge Computing Layer)

作為本方案的創新亮點，我們規劃部署 **8 台研華 MIC-743-AT 邊緣運算單元**於各業務單位。每台搭載 **NVIDIA Jetson Thor T5000** 處理器（2,070 TOPS FP4 算力、128GB LPDDR5X 記憶體），透過 **100GbE QSFP28 DAC** 線纜連接至 Leaf 交換器 (SN3420)，與中心平台實現高速資料同步。此設計使各單位能在本地執行知識庫查詢與輕量級推論，無需將敏感資料上傳至中心，兼顧了效能與資安。

### 2.3 部署模式：內部機房建置方案

經審慎評估 RFI 中對於「封閉式地端」的嚴格定義以及資料機敏性的高度要求，我們強烈建議並規劃將整體平台**建置於貴中心內部機房**。此方案雖面臨較多環境限制，但能最大程度地確保資料的實體安全與自主可控性，完全杜絕外部連線的風險，是唯一能完全符合 A 級機關最高資安標準的選項。我們已針對貴中心機房的環境限制（10kW/機櫃、無液冷、800kg/m² 載重、PUE<1.6）進行了詳盡的分析與規劃，後續章節將有詳細說明。

---

## 第三章 基礎設施層 (IaaS) 設計

基礎設施層是整個 AI 平台效能與穩定性的根本。我們的設計目標是在貴中心機房的環境限制下，打造一個效能頂尖、穩定可靠且易於擴充的硬體基礎。

### 3.1 運算子系統 (Compute Subsystem)

#### 3.1.1 算力需求分析

根據 RFI 文件表 5，本專案所需最低 GPU 總算力等同於 16 張 NVIDIA H100 SXM 等級 GPU 的總和。為滿足此需求並符合氣冷機房的功耗限制，我們提出兼具效能與能源效率的混合配置方案。

#### 3.1.2 GPU 配置方案

本方案採用 **NVIDIA H200 NVL 141GB PCIe** 與 **NVIDIA RTX 6000 Pro Server Blackwell Edition 96GB** 雙旗艦 GPU 混合配置策略，並依據不同工作負載特性進行分工：

**表 3-1：GPU 配置總覽**

| GPU 型號 | 數量 | 單卡 VRAM | 總 VRAM | 主要用途 |
|:---|:---:|:---:|:---:|:---|
| NVIDIA H200 NVL 141GB PCIe | 12 張 | 141 GB | 1,692 GB | 大型語言模型推論、模型微調、高精度運算 |
| NVIDIA RTX 6000 Pro Server Blackwell Edition 96GB | 6 張 | 96 GB | 576 GB | 中型模型推論、RAG 應用、多模態 AI |
| **合計** | **18 張** | — | **2,268 GB** | — |

**方案優勢：**

1. **效能超越**：H200 作為 H100 的升級版，提供 1.4 倍的記憶體頻寬提升，此組合在 FP32 與 FP16 精度下均大幅超越 RFI 算力要求。
2. **VRAM 優勢**：總 VRAM 高達 **2,268 GB**，能從容應對多個大型模型（如 Llama 3.1 70B、TAIDE-LX-7B 等）同時運行的需求。
3. **架構前瞻**：引入 H200 (Hopper) 與 RTX 6000 Blackwell 兩代最新架構 GPU，確保技術領先性與投資保護。
4. **功耗可控**：選用的 PCIe 版本 GPU 功耗較低，完全適用於氣冷環境。

**表 3-2：GPU 算力驗證表**

| 精度 | H200 PCIe (12 張) | RTX 6000 Blackwell (6 張) | 總算力 (TFLOPS) | RFI 需求算力 (TFLOPS) | 是否達標 |
|:---|:---:|:---:|:---:|:---:|:---:|
| FP32 | 792 | 756 | **1,548** | 1,072 | ✅ 超越 44% |
| FP16 | 23,664 | ~12,000 (估) | **~35,664** | 20,912 | ✅ 超越 70% |

#### 3.1.3 伺服器選型與配置

所有 GPU 伺服器統一採用 **HPE ProLiant DL380a Gen12 (4U)** 機架式伺服器。此型號是 HPE 專為 AI 工作負載設計的旗艦平台，支援最多 8 張雙寬 GPU，具備卓越的散熱設計與擴充能力。

**表 3-3：伺服器配置總覽**

| 伺服器角色 | GPU 配置 | 數量 | 每台 GPU 數 | CPU / 記憶體 |
|:---|:---|:---:|:---:|:---|
| H200 運算伺服器 | NVIDIA H200 NVL 141GB | 3 台 | 4 張 | 2x Intel Xeon 6 6745P / 1.5 TB |
| RTX 6000 運算伺服器 (4-GPU) | RTX 6000 Blackwell 96GB | 1 台 | 4 張 | 2x Intel Xeon 6 6745P / 1.5 TB |
| RTX 6000 運算伺服器 (2-GPU) | RTX 6000 Blackwell 96GB | 1 台 | 2 張 | 2x Intel Xeon 6 6527P / 512 GB |
| **合計** | — | **5 台** | **18 張** | — |

#### 3.1.4 伺服器詳細網卡配置

網卡的選型是確保 GPU 叢集效能的關鍵環節。根據 HPE 官方技術文件，不同的 GPU 數量配置對應不同的 PCIe 插槽規則與網卡安裝方式。以下分別說明：

**（一）4-GPU 配置伺服器（H200 伺服器 x3 + RTX 6000 伺服器 x1）**

在 4-GPU 配置下，DL380a Gen12 的 GPU Cage 內建專為 SmartNIC 設計的 PCIe 插槽，可安裝高階的 ConnectX-7 網卡，實現 GPU 直連高速網路。

**表 3-4：4-GPU 伺服器網卡配置**

| 用途 | 推薦網卡型號 | HPE 料號 | 速度 | 安裝位置 | 連接對象 |
|:---|:---|:---|:---|:---|:---|
| GPU 高速互聯 | NVIDIA ConnectX-7 | **P65333-B21** | 200GbE 雙埠 QSFP112 | GPU Cage SmartNIC 插槽 | Spine: SN3700C |
| 管理/儲存網路 | NVIDIA ConnectX-6 Lx | **P42044-B21** | 25GbE 雙埠 SFP28 | Riser Cage Slot 3 | Leaf: SN3420 |
| OCP 管理網路 | NVIDIA ConnectX-6 Lx OCP | **P42041-B21** | 25GbE 雙埠 SFP28 | OCP 3.0 Slot A | Leaf: SN3420 |

**表 3-5：4-GPU 伺服器 PCIe 插槽分配**

| PCIe 插槽 | 安裝元件 |
|:---|:---|
| GPU Cage Slot 13, 15, 17, 19 | 4x GPU (H200 或 RTX 6000 Blackwell) |
| GPU Cage NIC Slot 1 | 1x ConnectX-7 200GbE SmartNIC |
| Riser Cage Slot 3 | 1x ConnectX-6 Lx 25GbE |
| OCP 3.0 Slot A | 1x ConnectX-6 Lx 25GbE OCP |

**（二）2-GPU 配置伺服器（RTX 6000 伺服器 x1）**

在 2-GPU 配置下，GPU Cage 使用 captive riser 架構，SmartNIC 插槽不可用。因此，所有 NIC 安裝於後方 Riser Cage 與 OCP 插槽。由於僅有 2 張 GPU，100GbE 頻寬已綽綽有餘。

**表 3-6：2-GPU 伺服器網卡配置**

| 用途 | 推薦網卡型號 | HPE 料號 | 速度 | 安裝位置 | 連接對象 |
|:---|:---|:---|:---|:---|:---|
| GPU 高速互聯 | NVIDIA ConnectX-6 Dx | **P25960-B21** | 100GbE 雙埠 QSFP56 | Riser Cage Slot 1 | Spine: SN3700C |
| 管理/儲存網路 | NVIDIA ConnectX-6 Lx OCP | **P42041-B21** | 25GbE 雙埠 SFP28 | OCP 3.0 Slot A | Leaf: SN3420 |

**表 3-7：2-GPU 伺服器 PCIe 插槽分配**

| PCIe 插槽 | 安裝元件 |
|:---|:---|
| GPU Cage Slot 15, 17 | 2x RTX 6000 Pro Server Blackwell 96GB |
| Riser Cage Slot 1 | 1x ConnectX-6 Dx 100GbE |
| OCP 3.0 Slot A | 1x ConnectX-6 Lx 25GbE OCP |
| Riser Cage Slot 2, 3 | **空閒（可供未來擴充）** |

#### 3.1.5 機櫃配置規劃

為符合單機櫃 10kW 功率上限，我們規劃將 5 台伺服器分散至多個運算機櫃。每台 4-GPU 伺服器滿載功耗約 3.5-4.0 kW（含 CPU、記憶體、風扇等），2-GPU 伺服器約 2.0-2.5 kW，加上網路設備後，每個機櫃總功耗均控制在 10kW 以內。

### 3.2 儲存子系統 (Storage Subsystem)

#### 3.2.1 儲存需求分析

AI 平台的儲存系統需同時滿足以下需求：高吞吐量的模型檔案讀取（單一大型模型可達數十 GB）、低延遲的向量資料庫查詢、以及大容量的訓練資料與日誌儲存。

#### 3.2.2 儲存設備選型

**表 3-8：NetApp AFF A50 儲存配置**

| 項目 | 規格 |
|:---|:---|
| 推薦型號 | **NetApp AFF A50** 全快閃儲存陣列 |
| 配置數量 | **1 套 HA Pair**（2 個控制器） |
| 初始可用容量 | **80TB** |
| 最大擴充容量 | 最大有效容量可達 **186PB** |
| 儲存介質 | NVMe SSD (48 顆 1.92TB，原始容量 92.16TB，經 RAID-DP 後可用約 80TB) |
| 網路介面 | 100GbE QSFP28 x4 + 25GbE SFP28 x4（每控制器） |
| 作業系統 | NetApp ONTAP |

**方案優勢：**

1. **高可用性**：AFF A50 HA Pair 由 2 個控制器組成，實現控制器層級的備援，任一控制器故障時自動接管，確保儲存服務不中斷。
2. **極致效能**：AFF A50 提供微秒級的超低延遲與高 IOPS，是 AI 模型載入與向量資料庫工作負載的最佳選擇。
3. **資料保護**：內建的 ONTAP 作業系統提供完整的快照 (Snapshot)、SnapMirror 備份、SnapRestore 還原與 ONTAP Autonomous Ransomware Protection (ARP) 勒索軟體防護功能。
4. **協定支援**：同時支援 NFS、SMB、S3 等多種儲存協定，可靈活對應不同應用的存取需求。

### 3.3 網路子系統 (Network Subsystem)

#### 3.3.1 網路架構：Leaf-Spine

本方案採用業界主流的 **Leaf-Spine** 網路架構，提供高頻寬、低延遲、無阻塞、易擴充的網路環境。此架構由 2 台 Spine 交換器與 3 台 Leaf 交換器組成。

- **Spine 交換器 (2 台)**：**NVIDIA SN3700C** (32x100GbE)，作為網路骨幹，負責連接所有 Leaf 交換器。
- **Leaf 交換器 (3 台)**：**NVIDIA SN3420** (48x25GbE + 12x100GbE)，負責連接伺服器、儲存、防火牆等端點設備。

#### 3.3.2 網路流量規劃

為確保不同流量互不干擾，我們規劃了三個獨立的網路平面：

1. **GPU 高速互聯網路 (200GbE/100GbE)**：專為 GPU 之間的資料交換（如分散式訓練/推論）設計，直接連接至 Spine 交換器，提供最低延遲的路徑。
2. **儲存與管理網路 (25GbE)**：用於伺服器存取 NetApp 儲存、系統管理、以及 Kubernetes 叢集內部通訊，連接至 Leaf 交換器。
3. **帶外管理網路 (1GbE)**：用於伺服器 iLO/BMC 的遠端管理，連接至獨立的管理交換器。

### 3.4 資安邊界子系統 (Security Perimeter Subsystem)

詳見 2.2.1 節。

### 3.5 邊緣運算子系統 (Edge Computing Subsystem)

詳見 2.2.5 節。

---

## 第四章 服務與管理層 (PaaS) 設計

服務與管理層是將底層硬體資源轉化為可用 AI 服務的關鍵。我們提出的 **SEGMA 資源管理平台** 是一套功能強大、整合度高且專為企業級 AI 應用設計的 PaaS 解決方案，其設計理念在於實現 GPU 資源管理的「精細化」、「自動化」與「高效率」。

### 4.1 SEGMA 資源管理平台總覽

SEGMA 資源管理平台採用 Server-Worker 的雲原生架構，由一個中心化的 Server 端負責管理與調度，多個 Worker 端部署於 GPU 伺服器上執行實際任務。此架構具備高度的可擴展性與靈活性，能夠支援從單機到大規模叢集的部署需求。

- **核心功能**：
  - **GPU 資源池化與虛擬化**：將所有實體 GPU 資源池化，並提供 vGPU 切割能力，讓多個使用者或應用共享單張 GPU，大幅提升資源利用率。
  - **多租戶與權限管理**：支援多租戶模式，可為不同部門或專案建立獨立的工作空間，並進行精細的權限控管與資源配額設定。
  - **自動化模型部署**：提供圖形化介面，支援從 Hugging Face、ModelScope 或本地路徑一鍵部署模型，自動處理資源分配與服務上線。
  - **智慧化調度策略**：內建 Binpack（最大化利用率）與 Spread（最大化可用性）兩種調度策略，並透過多階段過濾演算法，為模型實例找到最適合的運算節點。
  - **全方位監控與告警**：深度整合 Prometheus 與 Grafana，提供從硬體到應用的全鏈路監控儀表板，並支援自訂告警規則。
  - **離線環境支援**：完整支援在 Air-Gapped 封閉式網路環境中進行部署與維運，確保最高的資訊安全等級。

### 4.2 資源管理與智慧調度機制

SEGMA 平台的核心優勢在於其強大的智慧調度器 (Scheduler)。當使用者發起一個模型部署請求時，調度器會經過「過濾 (Filtering)」與「評分 (Scoring)」兩個階段，為模型實例找到最優的 GPU 節點。

- **過濾階段 (Filtering Phase)**：調度器會依序執行一系列策略，篩選掉不符合條件的 Worker 節點。
  1. **叢集匹配策略 (Cluster Matching Policy)**：確保 Worker 屬於使用者指定的叢集。
  2. **GPU 匹配策略 (GPU Matching Policy)**：過濾出具備使用者指定型號 GPU 的 Worker。
  3. **標籤匹配策略 (Label Matching Policy)**：根據使用者設定的標籤（如 `env=prod`）進一步篩選。
  4. **狀態策略 (Status Policy)**：僅保留處於 `READY` 狀態的 Worker。
  5. **後端框架匹配策略 (Backend Framework Matching Policy)**：確保 Worker 支援模型所需的推論引擎框架。
  6. **資源適配策略 (Resource Fit Policy)**：此為最關鍵的策略，調度器會根據模型所需的 VRAM、CPU、RAM 資源，以及平台的資源放置優先級（單 GPU > 多 GPU > 跨節點 > CPU），計算出所有可能的部署方案。

- **評分階段 (Scoring Phase)**：通過過濾的候選節點會進入評分階段，根據使用者選擇的策略進行打分。
  - **Binpack 策略**：優先選擇剩餘資源最少的節點，傾向於將工作負載集中在少數節點上，以最大化整體資源利用率，並讓更多節點保持空閒以應對大型任務。
  - **Spread 策略**：優先選擇剩餘資源最多的節點，傾向於將工作負載均勻分散到所有可用節點上，以提高服務的容錯能力。

### 4.3 模型部署與 API 服務機制

SEGMA 平台簡化了從模型到服務的完整生命週期管理。

- **一鍵式模型部署**：使用者可透過圖形化介面，直接從 Hugging Face、ModelScope 等公開模型庫搜尋並匯入模型，或上傳本地模型檔案。平台支援副本數 (Replicas) 設定、自動擴縮容、以及多種效能優化配置，如 **Extended KV Cache**，可將 KV Cache 卸載至 CPU 記憶體，以支援更長的上下文長度。

- **統一 API 閘道 (SEGMA API Gateway)**：所有部署的模型服務都會自動註冊到內建的 API 閘道。此閘道提供與 OpenAI 完全相容的 API 端點 (`/v1/chat/completions`, `/v1/embeddings` 等)，讓現有應用程式無需修改程式碼即可無縫接軌。開發者可在平台上自行生成、管理 API Key，並為每個 Key 設定可存取的模型範圍與過期時間，實現安全的認證與授權。

### 4.4 系統監控與可觀測性

平台提供基於 **Prometheus** 與 **Grafana** 的全方位監控方案，並已預先建置好多個專業儀表板。

- **監控指標維度**：
  - **LLM 推論指標**：涵蓋請求數（運行中/等待中）、KV Cache 使用率、Prompt/Generation Token 計數、首字延遲 (TTFT)、Token 間延遲 (Inter-Token Latency)、端到端請求延遲 (E2E Latency) 等關鍵效能指標。
  - **Worker 節點指標**：包含節點狀態、CPU/GPU/VRAM 使用率、GPU 溫度、功耗、網路流量等硬體層級指標。
  - **Server 平台指標**：包含模型部署總數、模型實例總數、API 請求速率、Token 使用速率等平台營運指標。

- **儀表板規劃**：
  - **平台總覽儀表板**：呈現整體資源使用率、API 請求量、錯誤率等宏觀指標。
  - **GPU 深度監控儀表板**：顯示每張 GPU 的詳細指標，如溫度、功耗、VRAM 使用率、SM 利用率等。
  - **專案資源使用儀表板**：依專案（租戶）維度，顯示其資源配額與實際用量。
  - **資源使用報表**：定時生成各專案的資源使用報表，作為成本分攤與容量規劃的依據。

### 4.5 使用者、權限與叢集管理

- **使用者與權限管理**：平台內建完整的使用者管理系統，支援本地認證與 SSO 單一登入整合。管理員可以建立使用者、指派角色、並設定其對應的權限，實現精細化的存取控制。

- **叢集管理**：SEGMA 平台支援多叢集管理，可將不同地點、不同類型的 GPU 資源（如地端 Docker 叢集、Kubernetes 叢集、未來擴充的雲端資源）統一納管。使用者在部署模型時，可以指定要部署到哪個叢集，實現資源的邏輯分區與隔離。

---

## 第五章 專案管理與執行規劃

### 5.1 專案建置時程規劃

本專案預計自合約簽訂後 **20 週（約 5 個月）** 內完成全部建置與驗收。各階段規劃如下：

**表 5-1：專案建置時程表**

| 階段 | 工作項目 | 時程 | 里程碑 |
|:---|:---|:---|:---|
| **第一階段** | 需求確認與細部設計 | 第 1-3 週 | 完成系統設計文件 (SDD) |
| **第二階段** | 硬體採購與到貨 | 第 2-8 週 | 所有硬體設備到場 |
| **第三階段** | 機房環境整備 | 第 4-6 週 | 機櫃安裝、電力配線、網路佈線完成 |
| **第四階段** | 硬體安裝與網路建置 | 第 7-10 週 | 伺服器上架、交換器互聯、儲存陣列初始化完成 |
| **第五階段** | 軟體平台部署 | 第 11-14 週 | OS、容器平台、SEGMA 平台、Grafana 部署完成 |
| **第六階段** | 模型部署與效能調校 | 第 14-16 週 | 所有指定模型上線，效能指標達標 |
| **第七階段** | 邊緣運算單元部署 | 第 14-17 週 | 8 台 MIC-743-AT 部署至各單位並完成連線 |
| **第八階段** | 系統整合測試 (SIT) | 第 17-18 週 | 完成端到端功能測試與壓力測試 |
| **第九階段** | 使用者驗收測試 (UAT) | 第 19-20 週 | 完成驗收並正式上線 |

### 5.2 預算成本估算

**表 5-2：軟硬體設備成本估算表**

| 類別 | 項目 | 型號/規格 | 數量 | 單價 (萬元) | 小計 (萬元) |
|:---|:---|:---|:---:|:---:|:---:|
| **運算設備** | H200 運算伺服器 | HPE DL380a Gen12 + 4x H200 + 1.5TB RAM + 2x Xeon 6745P | 3 台 | 700 | 2,100 |
| | RTX 6000 運算伺服器 (4-GPU) | HPE DL380a Gen12 + 4x RTX 6000 Blackwell + 1.5TB RAM + 2x Xeon 6745P | 1 台 | 520 | 520 |
| | RTX 6000 運算伺服器 (2-GPU) | HPE DL380a Gen12 + 2x RTX 6000 Blackwell + 512GB RAM + 2x Xeon 6527P | 1 台 | 300 | 300 |
| **儲存設備** | 全快閃儲存陣列 | NetApp AFF A50 HA Pair (80TB 可用, 48x 1.92TB NVMe SSD) | 1 套 | 450 | 450 |
| **網路設備** | Spine 交換器 | NVIDIA SN3700C (MSN3700-CS2F) 32x100GbE | 2 台 | 85 | 170 |
| | Leaf 交換器 | NVIDIA SN3420 (MSN3420-CB2F) 48x25GbE + 12x100GbE | 3 台 | 45 | 135 |
| | 光纖/DAC 線纜 | 100GbE/200GbE QSFP 線纜 | 1 批 | — | 60 |
| **資安設備** | 防火牆 | Palo Alto Networks PA-5450 | 2 台 | 280 | 560 |
| | 應用交付控制器 | A10 Networks Thunder ADC | 2 台 | 120 | 240 |
| **邊緣運算** | 邊緣運算單元 | 研華 MIC-743-AT (Jetson Thor T5000, 128GB) | 8 台 | 75 | 600 |
| **機房基礎** | 42U 機櫃 | 含 PDU、理線架 | 4 座 | 8 | 32 |
| | UPS 電力保護 | 不斷電系統 | 1 套 | — | 80 |
| **軟體授權** | NetApp ONTAP 授權 | 含 SnapMirror、ARP | 1 套 | — | 含於儲存設備 |
| | Palo Alto 訂閱授權 | Threat Prevention + URL Filtering (3年) | 2 套 | 50 | 100 |
| **專業服務** | 系統整合與建置 | 含安裝、設定、測試、文件 | 1 式 | — | 350 |
| | 教育訓練 | 管理員訓練 + 使用者訓練 | 1 式 | — | 50 |
| | 維護保固 (3年) | 含硬體保固、軟體更新、技術支援 | 1 式 | — | 420 |
| | | | | **合計** | **約 6,167 萬** |

> **備註**：以上價格為市場參考估算，實際價格將依採購時之市場行情與議價結果而定。

### 5.3 風險評估與應對策略

**表 5-3：風險評估與應對策略**

| 風險項目 | 風險等級 | 可能影響 | 應對策略 |
|:---|:---:|:---|:---|
| GPU 供貨延遲 | 高 | 專案時程延後 | 提前下單、備選替代型號、與多家代理商建立供貨管道 |
| 機房功率不足 | 中 | 無法安裝所有設備 | 已規劃分散式機櫃配置，每櫃控制在 10kW 以內 |
| 模型效能未達標 | 中 | 驗收不通過 | 預留 2 週效能調校期，並配置超額算力作為緩衝 |
| 網路設備相容性問題 | 低 | 部署延遲 | 全採用 NVIDIA 生態系產品，確保最佳相容性 |
| 離線環境軟體部署困難 | 中 | 部署時程延長 | 預先建立離線安裝套件庫，含所有軟體依賴項 |
| 邊緣運算單元部署協調 | 中 | 各單位部署進度不一 | 指定專責 PM 協調各單位，採分批部署策略 |

---

## 第六章 結論與展望

### 6.1 方案總結

本文件完整呈現了云碩科技針對財政部財政資訊中心「智慧算力共用平臺建置委外服務案」所提出的全棧式 AI 平台解決方案。本方案的核心價值主張可歸納為以下五點：

1. **頂尖算力，超越需求**：以 12 張 NVIDIA H200 與 6 張 RTX 6000 Blackwell 組成的混合 GPU 叢集，提供超越 RFI 要求 44%-70% 的強大算力，確保平台在未來數年內均能從容應對不斷增長的 AI 工作負載。

2. **安全至上，滴水不漏**：從資安邊界層的 Palo Alto 防火牆與 A10 WAF 雙重防護，到內部網路的實體隔離與微分段，再到 NetApp ONTAP 的勒索軟體防護，構建了一個從外到內、從上到下的全方位資安防護體系。

3. **智慧管理，自動化維運**：以 **SEGMA 資源管理平台** 為核心，實現從資源申請、模型部署到監控告警的全流程自動化，並透過智慧調度演算法最大化資源利用率，大幅降低維運人力成本。

4. **中心與邊緣協同，雙層智慧**：創新性地導入 8 台研華 MIC-743-AT 邊緣運算單元，實現「集中訓練、分散推論」的雙層架構，讓 AI 能力真正觸及每一個業務單位。

5. **模組化設計，面向未來**：從 GPU 伺服器、儲存陣列到網路交換器，均採用模組化、可水平擴展的設計，確保未來可平滑擴充至數倍規模，保護貴中心的長期投資。

### 6.2 云碩科技的獨特優勢

云碩科技作為深耕 AI 基礎設施與數據中台領域的專業系統整合商，具備以下獨特優勢：

1. **全棧技術能力**：從硬體架構設計、網路規劃、到軟體平台部署，具備端到端的技術整合能力。
2. **原廠合作關係**：與 NVIDIA、HPE、NetApp、Palo Alto Networks、A10 Networks、研華等國際大廠維持緊密的合作夥伴關係，確保供貨穩定與技術支援。
3. **政府專案經驗**：擁有豐富的政府機關資訊系統建置經驗，深諳政府採購法規與 A 級機關資安規範。
4. **在地服務承諾**：提供 7x24 全天候技術支援，並承諾在合約期間內提供定期巡檢、效能優化與技術諮詢服務。

### 6.3 展望

我們深信，本方案將為財政部財政資訊中心打造一個安全、高效、智慧且面向未來的 AI 算力基礎設施，不僅解決當前的算力缺口，更為貴中心未來十年的 AI 發展藍圖奠定堅實的基石。云碩科技期待與貴中心攜手合作，共同推動智慧財政的創新與發展。

---

## 附錄 A：伺服器詳細配置表

### A.1 H200 運算伺服器（4-GPU 配置）x 3 台

| 元件 | 規格 | 數量 |
|:---|:---|:---:|
| 伺服器 | HPE ProLiant DL380a Gen12 (4U) | 1 |
| 處理器 | 2x Intel Xeon 6 6745P | 2 |
| 記憶體 | 1.5 TB (16x 96GB DDR5-6400) | 16 |
| GPU | 4x NVIDIA H200 NVL 141GB PCIe | 4 |
| NVLink | 4-way NVLink Bridge | 1 組 |
| 高速網卡 | 1x NVIDIA ConnectX-7 200GbE (P65333-B21) | 1 |
| 管理網卡 | 1x NVIDIA ConnectX-6 Lx 25GbE (P42044-B21) | 1 |
| OCP 網卡 | 1x NVIDIA ConnectX-6 Lx 25GbE OCP (P42041-B21) | 1 |
| 系統碟 | 2x NVMe SSD 1.92TB (RAID 1) | 2 |
| 電源 | 6x HPE 2400W Flex Slot Titanium | 6 |

### A.2 RTX 6000 運算伺服器（4-GPU 配置）x 1 台

| 元件 | 規格 | 數量 |
|:---|:---|:---:|
| 伺服器 | HPE ProLiant DL380a Gen12 (4U) | 1 |
| 處理器 | 2x Intel Xeon 6 6745P | 2 |
| 記憶體 | 1.5 TB (16x 96GB DDR5-6400) | 16 |
| GPU | 4x NVIDIA RTX 6000 Pro Server Blackwell Edition 96GB (S6A73C) | 4 |
| 高速網卡 | 1x NVIDIA ConnectX-7 200GbE (P65333-B21) | 1 |
| 管理網卡 | 1x NVIDIA ConnectX-6 Lx 25GbE (P42044-B21) | 1 |
| OCP 網卡 | 1x NVIDIA ConnectX-6 Lx 25GbE OCP (P42041-B21) | 1 |
| 系統碟 | 2x NVMe SSD 1.92TB (RAID 1) | 2 |
| 電源 | 6x HPE 2400W Flex Slot Titanium | 6 |

### A.3 RTX 6000 運算伺服器（2-GPU 配置）x 1 台

| 元件 | 規格 | 數量 |
|:---|:---|:---:|
| 伺服器 | HPE ProLiant DL380a Gen12 (4U) | 1 |
| 處理器 | 2x Intel Xeon 6 6527P | 2 |
| 記憶體 | 512 GB (16x 32GB DDR5-5600) | 16 |
| GPU | 2x NVIDIA RTX 6000 Pro Server Blackwell Edition 96GB (S6A73C) | 2 |
| NVLink | 2-way NVLink Bridge | 1 組 |
| 高速網卡 | 1x NVIDIA ConnectX-6 Dx 100GbE (P25960-B21) | 1 |
| OCP 網卡 | 1x NVIDIA ConnectX-6 Lx 25GbE OCP (P42041-B21) | 1 |
| 系統碟 | 2x NVMe SSD 1.92TB (RAID 1) | 2 |
| 電源 | 4x HPE 2400W Flex Slot Titanium | 4 |

---

## 參考文獻

[1] 財政部財政資訊中心. (2025). 智慧算力共用平臺建置委外服務案公開徵求資訊 (RFI) 說明文件.

[2] NVIDIA. (2024). *NVIDIA H200 Tensor Core GPU Datasheet*. Available: https://www.nvidia.com/en-us/data-center/h200/

[3] NVIDIA. (2025). *NVIDIA RTX PRO 6000 Blackwell Server Edition Datasheet*. Available: https://www.nvidia.com/en-us/design-visualization/rtx-pro-6000-server-edition/

[4] HPE. (2025). *HPE ProLiant Compute DL380a Gen12 QuickSpecs*. Available: https://www.hpe.com/psnow/doc/a00047453enw

[5] HPE. (2025). *HPE ProLiant Compute DL380a Gen12 User Guide — PCIe NIC Population Rules*. Available: https://support.hpe.com/hpesc/public/docDisplay?docId=sd00005071en_us

[6] NetApp. (2025). *NetApp AFF A-Series for the AI Era Datasheet*. Available: https://www.netapp.com/media/7828-ds-3582-aff-a-series-ai-era.pdf

[7] NVIDIA. (2024). *NVIDIA Spectrum-2 SN3700C Switch Datasheet*. Available: https://www.nvidia.com/en-us/networking/ethernet-switching/

[8] NVIDIA. (2024). *NVIDIA Spectrum-2 SN3420 Switch Datasheet*. Available: https://www.nvidia.com/en-us/networking/ethernet-switching/

[9] NVIDIA Docs. (2023). *HPE & NVIDIA Networking Ethernet and InfiniBand Adapters and HPE Platform Support*. Available: https://docs.nvidia.com/networking/display/HNNEAHPS

[10] Palo Alto Networks. (2024). *PA-5450 Series Datasheet*. Available: https://www.paloaltonetworks.com/network-security/next-generation-firewall/pa-5400-series

[11] A10 Networks. (2024). *Thunder ADC Datasheet*. Available: https://www.a10networks.com/products/thunder-adc/

[12] 研華科技. (2025). *MIC-743-AT Datasheet*. Available: https://www.advantech.com/

[13] StorageReview. (2025). *HPE ProLiant DL380a Gen12 Review: Air Cooled 4U Server for Dense Multi GPU AI*. Available: https://www.storagereview.com/review/hpe-proliant-dl380a-gen12-review-air-cooled-4u-server-for-dense-multi-gpu-ai

[14] vLLM Project. (2024). *vLLM: Easy, Fast, and Cheap LLM Serving*. Available: https://vllm.ai/

[15] Grafana Labs. (2024). *Grafana: The Open Observability Platform*. Available: https://grafana.com/

[16] Milvus. (2024). *Milvus: The World's Most Advanced Open-Source Vector Database*. Available: https://milvus.io/

---

**文件結束**

**提案廠商：云碩科技 (xCloudinfo Group)**

**聯絡人：Jeff Lee 總經理**

**云碩科技 Jefflee 繪製**
