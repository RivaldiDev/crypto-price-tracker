"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkline } from "@/components/sparkline";
import { AnimatedBackground } from "@/components/animated-background";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";

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

function formatPrice(n: number): string {
  if (n >= 1) return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toFixed(6);
}

function ChangeBadge({ value }: { value: number | null }) {
  const v = value ?? 0;
  const positive = v >= 0;
  return (
    <Badge
      variant="outline"
      className={
        positive
          ? "text-green-400 border-green-400/20 bg-green-400/10 text-xs gap-0.5"
          : "text-red-400 border-red-400/20 bg-red-400/10 text-xs gap-0.5"
      }
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(v).toFixed(2)}%
    </Badge>
  );
}

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [gRes, cRes] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/global"),
        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
        ),
      ]);

      if (!cRes.ok) {
        throw new Error(`API error: ${cRes.status} ${cRes.statusText}`);
      }

      const gData = await gRes.json();
      const cData = await cRes.json();
      setGlobal(gData);
      setCoins(cData);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to fetch data. Rate limit may be exceeded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000); // 2min to avoid rate limits
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <AnimatedBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CryptoPulse
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Real-time market data &middot; CoinGecko API
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coins..."
                className="w-40 sm:w-56 pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {global && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {[
            { label: "Market Cap", value: "$" + formatNum(global.data.total_market_cap.usd) },
            { label: "24h Volume", value: "$" + formatNum(global.data.total_volume.usd) },
            { label: "BTC Dominance", value: global.data.market_cap_percentage.btc.toFixed(1) + "%" },
            { label: "Active Coins", value: global.data.active_cryptocurrencies.toLocaleString() },
            { label: "Updated", value: lastUpdated ? lastUpdated.toLocaleTimeString() : "--" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/[0.03] border-white/[0.06]">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm sm:text-base font-bold text-cyan-400 mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
          Top Cryptocurrencies by Market Cap
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-10 text-slate-500">#</TableHead>
                <TableHead className="text-slate-500">Coin</TableHead>
                <TableHead className="text-slate-500 text-right">Price</TableHead>
                <TableHead className="text-slate-500 text-right">1h</TableHead>
                <TableHead className="text-slate-500 text-right">24h</TableHead>
                <TableHead className="text-slate-500 text-right">7d</TableHead>
                <TableHead className="text-slate-500 text-right hidden sm:table-cell">Volume</TableHead>
                <TableHead className="text-slate-500 text-right hidden md:table-cell">Mkt Cap</TableHead>
                <TableHead className="text-slate-500 text-right hidden lg:table-cell">7D Chart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((coin) => (
                <TableRow
                  key={coin.id}
                  className="border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell className="text-slate-500 text-sm">
                    {coin.market_cap_rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coin.image}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-sm leading-tight">{coin.name}</p>
                        <p className="text-xs text-slate-500">{coin.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatPrice(coin.current_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ChangeBadge value={coin.price_change_percentage_1h_in_currency} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ChangeBadge value={coin.price_change_percentage_24h} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ChangeBadge value={coin.price_change_percentage_7d_in_currency} />
                  </TableCell>
                  <TableCell className="text-right text-slate-400 text-sm hidden sm:table-cell">
                    ${formatNum(coin.total_volume)}
                  </TableCell>
                  <TableCell className="text-right text-slate-400 text-sm hidden md:table-cell">
                    ${formatNum(coin.market_cap)}
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    <Sparkline
                      data={coin.sparkline_in_7d.price}
                      width={100}
                      height={28}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-slate-600 border-t border-white/5">
        CryptoPulse &copy; 2026 &middot; Data from CoinGecko &middot; Built with Next.js + shadcn/ui
      </footer>
    </div>
  );
}
