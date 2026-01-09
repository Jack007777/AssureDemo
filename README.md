# Wheelchair Configurator (Demo Scaffold)

这是一个可商用的“轮椅配置器”前端脚手架（Vue 3 + Vite + TypeScript + Pinia），内置：
- 示例 Catalog / Rules / Pricing JSON（`src/data/`）
- 简单规则校验引擎（`src/lib/rules.ts`）
- 实时价格计算（`src/lib/pricing.ts`）
- 一键导出配置单 PDF（`src/lib/pdf.ts`）

## 运行
```bash
npm install
npm run dev
```

## 构建
```bash
npm run build
npm run preview
```

## 说明
- 这是 **Demo Scaffold**，用于快速跑通“选配 + 规则提示 + 报价 + PDF导出”闭环。
- 后续你可以把 `src/data/*.json` 替换为厂商真实数据。
