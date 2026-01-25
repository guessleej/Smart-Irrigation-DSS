# xCloudMOPs 架構分析

## 架構圖 1: AI 數據中台總覽

### 應用層 (應用)
- **企業內部**: 企業門戶、單點登錄、數據權限、消息通知、智能問答、其他應用

### 數據展示層 (AI 數據中台)
- **數據可視化**: 網頁解析、多端訪問、企業場景、Grafana、Dify
- **數據共享 API**: API 服務、同步服務

### 數據計算層
- **模型推理**: Xinference、Ollama、Deepseek R1、Qwen 2.5 Max、Gemini/Qwen VL、Embedding、Reranker
- **知識庫-本地化**: RAG 引擎、數據採集、知識庫同步
- **知識庫-阿里雲**: RAG 引擎、數據採集、知識庫同步

### 數據存儲層
- Elasticsearch、PostgreSQL、MySQL、Redis、Aliyun-OSS、其他

### 雲基礎設施
- Docker、本地化、K8s、阿里雲

### 運維 & 資源
- 數據質量、元數據、集群監控、開發工具、任務調度、數據安全

---

## 架構圖 2: 大模型 AI 中台詳細架構

### 入口層
- Dify AI Applications (https/http)
- 阿里雲 WAF、阿里雲 ALB

### Kubernetes 集群
- 反向代理 (安全認證、基礎認證)
- Ingress 入口

### SaaS 服務集群
- **Dify Service**: WEB And AI Provider
- **Agent Service**: API And VLLM

### 基礎服務集群
- **RAG Service**: Text Generation
- **AI Service**: Chat Assistant
- **Workflow Service**: Workflow

### 存儲層
- **Cache**: Redis Cluster
- **Vector DB**: Elastic Cluster
- **Storage**: OSS
- **Database**: Postgres Cluster

### LLM Services
- Xinference、Ollama、vLLM

### IndexBuilder
- Worker And Service (DATA & FILE)
- 模型數據、業務數據

### 運行環境
- Kubernetes、Docker 運行時容器、雲服務、Linux 操作系統

---

## 架構圖 3: 核心模組架構 (Dify 風格)

### nginx 反向代理

### 應用服務
- **dify web**: 前端工程
- **dify api**: Rest 接口、工作流、知識庫管理、插件管理
- **dify worker**: 索引生成、定時任務、Func 3

### 核心模塊
- **RAG**: 文檔解析、索引生成、召回、對接大模型
- **AI 應用**: 工作區管理、業務編排、模型管理、對外 API、Agent 配置、插件、變量、節點

### 基礎設施
- **基礎技術開發框架**: Flask、React、Docker、Celery、POETRY、LLM
- **基礎中間件**: PGSQL、Redis、Weaviate

---

## 架構圖 4: RAG 模組流程

### 文檔處理流程
Local Document → Extractor → Cleaner → Splitter → Vector db

### 查詢流程
question → Retrieval → Rerank → LLM

---

## 架構圖 5: RAG 應用架構

### 文檔處理
文檔 → 文本切分 → 文本塊 → Embedding 模型 → 向量 → VectorDB

### 查詢處理
提問 → Embedding 模型 → 向量 → 查詢 VectorDB → 向量相似度 → 查詢結果 → 相關文本塊 → 提示詞模版 → 提示詞 → 答案

### 應用場景
搜索、推薦、個人助理、對話機器人

---

## 架構圖 6: RAGFlow 詳細架構

### 前端
- Questions → Web Nginx → Answer
- Documents → File

### API Server
- Query Analyze
- Task Dispatch

### 檢索流程
- Multi-way Recall → Re-rank → Answer → LLMs

### 文檔處理
- Document Parser
- OCR
- Task Executor
- Document Layout Analyze
- Table Structure Recognition

### 存儲
- Chunk → Vector DB
- Keyword & Embedding

---

## 架構圖 7: LLM 核心架構

### 外設 I/O
- video、audio

### 軟體工具
- Calculator、Python interpreter、Terminal

### 網路
- Browser、Other LLMs

### 存儲
- File system (+embeddings)

### 核心
- LLM (CPU, RAM with context window)

---

## 架構圖 8: 企業數據處理流程

### 數據流
企業內部數據 → 同步與轉換 → Infinity 數據庫

### 處理分支
1. 向量數據庫建模 → 標量字段生成 → ETL 流程 → 維護性與數據一致性問題
2. 搜索引擎 → 多表聯合查詢 → 複雜查詢需求
3. 結構化數據查詢 → 全文搜索 → 複雜查詢需求

### 最終處理
即時響應與高並發處理 → Infinity 數據庫 → 融合排序

---

## 架構圖 9: RAG 詳細分層架構

### 前端展現層
- PC端
- 移動端（未實現）

### 接口服務層
- 文件管理
- 知識庫管理
- 模型管理
- 助手管理
- 對話管理
- 其他服務...

### 業務邏輯層

#### RAG 核心層
- 向量檢索引擎
- 混合搜索策略
- 召回與重排序
- 上下文融合

#### Agent 層
- 畫布設計器
- 組件庫管理
- 工作流引擎
- 狀態管理

#### GraphRAG 層
- 知識圖譜構建
- 實體關係抽取
- 圖推理搜索
- 多跳推理

#### 工作流編排層
- 任務調度引擎
- 流程編排器
- 條件分支邏輯
- 錯誤處理恢復

### 深度文檔層
- Vision 視覺模塊
- Parser 解析器
- 結構化提取
- 質量評估

### 模型適配層
- 對話模型
- 嵌入模型
- 重排序模型
- 多模態模型

### 數據存儲層
- MySQL
- Redis
- ES/Infinity
- MinIO

### 基礎設施層（右側）
- 日誌記錄
- 錯誤處理
- 緩存處理
- 身份認證
- 性能監控
