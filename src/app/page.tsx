"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: { price: number[] };
}

interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number };
    active_cryptocurrencies: number;
  };
}

function formatNum(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [gRes, cRes] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/global"),
        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
        ),
      ]);
      const gData = await gRes.json();
      const cData = await cRes.json();
      setGlobal(gData);
      setCoins(cData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-[#0a0e17] to-cyan-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/5 backdrop-blur-xl bg-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CryptoPulse
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time market data powered by CoinGecko API
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search coins..."
              className="w-64 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:opacity-90 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.header>

      {/* Stats Bar */}
      {global && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto px-6 py-4 flex gap-6"
        >
          {[
            { label: "Total Market Cap", value: "$" + formatNum(global.data.total_market_cap.usd) },
            { label: "24h Volume", value: "$" + formatNum(global.data.total_volume.usd) },
            { label: "BTC Dominance", value: global.data.market_cap_percentage.btc.toFixed(1) + "%" },
            { label: "Active Coins", value: global.data.active_cryptocurrencies.toLocaleString() },
            { label: "Last Updated", value: new Date().toLocaleTimeString() },
          ].map((stat) => (
            <Card key={stat.label} className="flex-1 bg-white/5 border-white/5 backdrop-blur">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-cyan-400 mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <Separator className="max-w-7xl mx-auto bg-white/5" />

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
          Top Cryptocurrencies by Market Cap
        </h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Fetching live prices...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["#", "Coin", "Price", "1h", "24h", "7d", "Volume", "Market Cap", "7D Chart"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-[11px] text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((coin, i) => (
                  <motion.tr
                    key={coin.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 text-slate-500 text-sm">{coin.market_cap_rank}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-semibold text-sm">{coin.name}</p>
                          <p className="text-xs text-slate-500">{coin.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-sm">
                      ${coin.current_price >= 1 ? coin.current_price.toLocaleString() : coin.current_price.toFixed(4)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${(coin.price_change_percentage_1h_in_currency ?? 0) >= 0 ? "text-green-400 border-green-400/20 bg-green-400/10" : "text-red-400 border-red-400/20 bg-red-400/10"}`}
                      >
                        {(coin.price_change_percentage_1h_in_currency ?? 0).toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${(coin.price_change_percentage_24h ?? 0) >= 0 ? "text-green-400 border-green-400/20 bg-green-400/10" : "text-red-400 border-red-400/20 bg-red-400/10"}`}
                      >
                        {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "text-green-400 border-green-400/20 bg-green-400/10" : "text-red-400 border-red-400/20 bg-red-400/10"}`}
                      >
                        {(coin.price_change_percentage_7d_in_currency ?? 0).toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm">${formatNum(coin.total_volume)}</td>
                    <td className="py-4 px-4 text-slate-400 text-sm">${formatNum(coin.market_cap)}</td>
                    <td className="py-4 px-4">
                      <Sparkline
                        data={coin.sparkline_in_7d.price}
                        positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-xs text-slate-600 border-t border-white/5">
        CryptoPulse &copy; 2026 | Data from CoinGecko Free API | Built with Next.js + shadcn/ui + Framer Motion
      </footer>
    </div>
  );
}
