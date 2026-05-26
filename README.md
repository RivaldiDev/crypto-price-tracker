<div align="center">

# CryptoPulse

**Real-time cryptocurrency price tracker with live market data, sparkline charts, and market analytics.**

[![Tech Stack](https://skillicons.dev/icons?i=nextjs,typescript,tailwind,github&theme=dark&perline=4)](https://skillicons.dev)

![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Components-000000?style=for-the-badge)

[![GitHub](https://img.shields.io/badge/Source_Code-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RivaldiDev/crypto-price-tracker)

[Overview](#overview) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Architecture](#architecture)

</div>

---

## Overview

Real-time cryptocurrency price tracker showing top 50 coins by market cap with sparkline charts, price changes, and global market stats.

Built with **Next.js 16** (App Router, TypeScript), **shadcn/ui**, **Tailwind CSS 4**, and **Framer Motion**.

## Features

| Area | What it does |
| --- | --- |
| **Market Data** | Live prices for top 50 coins with 7-day sparkline charts. |
| **Search & Filter** | Instant search by coin name or symbol. |
| **Price Changes** | Color-coded badges for 1h, 24h, and 7d changes with trend icons. |
| **Global Stats** | Market cap, 24h volume, BTC dominance, active coins. |
| **Error Handling** | API rate limit detection with clear error messages. |
| **Responsive** | Mobile-first table with progressive column reveal. |

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **UI Components** | shadcn/ui (Radix + Tailwind) |
| **Styling** | Tailwind CSS 4 with custom animations |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **API** | CoinGecko API (free tier, 2min refresh) |

## Getting Started

```bash
git clone https://github.com/RivaldiDev/crypto-price-tracker.git
cd crypto-price-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Dashboard with table, stats, search
│   └── globals.css         # Tailwind + custom animations
├── components/
│   ├── animated-background.tsx  # Gradient orbs + grid pattern
│   ├── sparkline.tsx       # SVG sparkline with gradient fill
│   └── ui/                 # shadcn/ui primitives
└── lib/
    └── utils.ts            # cn() helper
```

## API

Uses [CoinGecko API](https://www.coingecko.com/en/api/documentation) free tier:

- `/api/v3/global` — total market cap, volume, BTC dominance
- `/api/v3/coins/markets` — top 50 coins with sparklines

Auto-refreshes every 2 minutes. Free tier: ~10-30 req/min.

---

<div align="center">

![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>
