'use client';

import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketTypeRevenue {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

interface RevenueOptimizationDashboardProps {
  ticketTypes: TicketTypeRevenue[];
  eventId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function getDemandLevel(sold: number, quantity: number): { label: string; color: string; pct: number } {
  if (quantity === 0) return { label: 'N/A', color: 'text-slate-400', pct: 0 };
  const pct = (sold / quantity) * 100;
  if (pct >= 90) return { label: 'Very High', color: 'text-red-600 dark:text-red-400', pct };
  if (pct >= 70) return { label: 'High', color: 'text-orange-600 dark:text-orange-400', pct };
  if (pct >= 40) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', pct };
  return { label: 'Low', color: 'text-green-600 dark:text-green-400', pct };
}

function getDynamicPricingRecommendation(sold: number, quantity: number, currentPrice: number): string {
  if (quantity === 0) return 'No capacity set';
  const pct = (sold / quantity) * 100;
  if (pct >= 90) return `High demand — consider raising price to ${fmt(currentPrice * 1.25)}`;
  if (pct >= 70) return `Good demand — maintain or slight increase to ${fmt(currentPrice * 1.1)}`;
  if (pct >= 40) return `Moderate demand — current price ${fmt(currentPrice)} is optimal`;
  if (pct >= 20) return `Low demand — consider a discount: ${fmt(currentPrice * 0.85)}`;
  return `Very low demand — consider a 20% promo: ${fmt(currentPrice * 0.8)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * KAN-130: Revenue Optimization Tools
 * Shows revenue metrics, price simulation, dynamic pricing recommendations,
 * and revenue forecast per ticket type.
 */
export default function RevenueOptimizationDashboard({
  ticketTypes,
  eventId,
}: RevenueOptimizationDashboardProps) {
  // Simulated prices per ticket type (for what-if analysis)
  const [simPrices, setSimPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    ticketTypes.forEach((tt) => { init[tt.id] = tt.price; });
    return init;
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'recommendations'>('overview');

  // ─── Derived Metrics ──────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const actual = ticketTypes.reduce((s, tt) => s + tt.price * tt.sold, 0);
    const potential = ticketTypes.reduce((s, tt) => s + tt.price * tt.quantity, 0);
    const simulated = ticketTypes.reduce((s, tt) => s + (simPrices[tt.id] ?? tt.price) * tt.sold, 0);
    const simPotential = ticketTypes.reduce((s, tt) => s + (simPrices[tt.id] ?? tt.price) * tt.quantity, 0);
    const totalSold = ticketTypes.reduce((s, tt) => s + tt.sold, 0);
    const totalCapacity = ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
    return { actual, potential, simulated, simPotential, totalSold, totalCapacity };
  }, [ticketTypes, simPrices]);

  const revenueDiff = totals.simulated - totals.actual;

  // ─── Render ──────────────────────────────────────────────────────────────

  if (ticketTypes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">No ticket types yet</p>
        <p className="text-sm mt-1">Add ticket types to see revenue optimization tools</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Actual Revenue" value={fmt(totals.actual)} sub="from tickets sold" color="indigo" />
        <SummaryCard label="Revenue Potential" value={fmt(totals.potential)} sub="if sold out" color="green" />
        <SummaryCard
          label="Tickets Sold"
          value={`${totals.totalSold} / ${totals.totalCapacity}`}
          sub={totals.totalCapacity > 0 ? `${Math.round((totals.totalSold / totals.totalCapacity) * 100)}% fill rate` : 'No capacity'}
          color="blue"
        />
        <SummaryCard
          label="Avg. Ticket Price"
          value={ticketTypes.length > 0 ? fmt(ticketTypes.reduce((s, tt) => s + tt.price, 0) / ticketTypes.length) : '$0'}
          sub="across all ticket types"
          color="purple"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {(['overview', 'simulation', 'recommendations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'simulation' ? 'Price Simulator' : tab === 'recommendations' ? 'Dynamic Pricing' : 'Overview'}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Ticket Type', 'Price', 'Sold / Qty', 'Fill Rate', 'Revenue', 'Potential'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ticketTypes.map((tt) => {
                const fillRate = tt.quantity > 0 ? Math.round((tt.sold / tt.quantity) * 100) : 0;
                return (
                  <tr key={tt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{tt.name}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{fmt(tt.price)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{tt.sold} / {tt.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${fillRate >= 80 ? 'bg-red-500' : fillRate >= 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                            style={{ width: `${fillRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{fillRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-700 dark:text-indigo-400">{fmt(tt.price * tt.sold)}</td>
                    <td className="px-4 py-3 text-green-700 dark:text-green-400">{fmt(tt.price * tt.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white" colSpan={4}>Total</td>
                <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400">{fmt(totals.actual)}</td>
                <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">{fmt(totals.potential)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab: Price Simulation */}
      {activeTab === 'simulation' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adjust ticket prices below to simulate how revenue would change. This is a what-if analysis — no actual prices are modified.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Ticket Type', 'Current Price', 'Simulated Price', 'Actual Revenue', 'Simulated Revenue', 'Difference'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ticketTypes.map((tt) => {
                  const simPrice = simPrices[tt.id] ?? tt.price;
                  const actualRev = tt.price * tt.sold;
                  const simRev = simPrice * tt.sold;
                  const diff = simRev - actualRev;
                  return (
                    <tr key={tt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{tt.name}</td>
                      <td className="px-4 py-3 text-slate-500">{fmt(tt.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={simPrice}
                            onChange={(e) => setSimPrices((prev) => ({
                              ...prev,
                              [tt.id]: parseFloat(e.target.value) || 0,
                            }))}
                            className="w-24 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{fmt(actualRev)}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-700 dark:text-indigo-400">{fmt(simRev)}</td>
                      <td className={`px-4 py-3 font-semibold ${diff > 0 ? 'text-green-600 dark:text-green-400' : diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                        {diff > 0 ? '+' : ''}{fmt(diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white" colSpan={3}>Total</td>
                  <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{fmt(totals.actual)}</td>
                  <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400">{fmt(totals.simulated)}</td>
                  <td className={`px-4 py-3 font-bold ${revenueDiff > 0 ? 'text-green-600 dark:text-green-400' : revenueDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                    {revenueDiff > 0 ? '+' : ''}{fmt(revenueDiff)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Simulation summary */}
          <div className={`p-4 rounded-xl border ${revenueDiff > 0 ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : revenueDiff < 0 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <p className={`text-sm font-medium ${revenueDiff > 0 ? 'text-green-800 dark:text-green-300' : revenueDiff < 0 ? 'text-red-800 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'}`}>
              {revenueDiff > 0
                ? `Price adjustment would increase revenue by ${fmt(revenueDiff)} (${Math.round((revenueDiff / totals.actual) * 100)}% uplift on already-sold tickets)`
                : revenueDiff < 0
                ? `Price decrease would reduce revenue by ${fmt(Math.abs(revenueDiff))} but may attract more buyers`
                : 'No price changes simulated yet — adjust prices above to see the impact'}
            </p>
          </div>

          <button
            onClick={() => {
              const reset: Record<string, number> = {};
              ticketTypes.forEach((tt) => { reset[tt.id] = tt.price; });
              setSimPrices(reset);
            }}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
          >
            Reset to current prices
          </button>
        </div>
      )}

      {/* Tab: Dynamic Pricing Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            AI-powered pricing recommendations based on current demand and inventory levels.
          </p>

          <div className="grid gap-4">
            {ticketTypes.map((tt) => {
              const demand = getDemandLevel(tt.sold, tt.quantity);
              const recommendation = getDynamicPricingRecommendation(tt.sold, tt.quantity, tt.price);
              const remaining = tt.quantity - tt.sold;
              const revenueUntilSoldOut = remaining * tt.price;

              return (
                <div key={tt.id} className="p-5 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{tt.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Current price: {fmt(tt.price)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      demand.pct >= 70 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      demand.pct >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {demand.label} Demand
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{tt.sold}</p>
                      <p className="text-xs text-slate-500">Sold</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{remaining}</p>
                      <p className="text-xs text-slate-500">Remaining</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmt(revenueUntilSoldOut)}</p>
                      <p className="text-xs text-slate-500">If sold out</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300">{recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'indigo' | 'green' | 'blue' | 'purple';
}) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    green: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-800 text-green-700 dark:text-green-300',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}
