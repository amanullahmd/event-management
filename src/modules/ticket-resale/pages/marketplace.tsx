'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  getActiveResaleListings,
  getMyResaleListings,
  createResaleListing,
  purchaseResaleListing,
  cancelResaleListing,
  getAllTickets,
  ResaleListing,
  Ticket,
} from '@/modules/shared-common/services/apiService';
import {
  Store,
  Tag,
  MapPin,
  Calendar,
  Ticket as TicketIcon,
  Plus,
  X,
  Check,
  RefreshCw,
  ChevronDown,
  ShoppingCart,
  ArrowUpDown,
  Eye,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/modules/shared-common/components/ui/button';

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  sold:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  expired:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

function formatCurrency(amount: number | undefined, currency = 'USD') {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return 'TBA';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return dateStr; }
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'browse' | 'my-listings'>('browse');

  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [myListings, setMyListings] = useState<ResaleListing[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sell modal
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({ ticketId: '', resalePrice: '', sellerNote: '' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Purchase confirm
  const [purchaseTarget, setPurchaseTarget] = useState<ResaleListing | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<{ ticketNumber: string; eventTitle: string; price: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [priceError, setPriceError] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [active, my, tickets] = await Promise.all([
        getActiveResaleListings(),
        getMyResaleListings().catch(() => []),
        getAllTickets().catch(() => []),
      ]);
      setListings(active);
      setMyListings(my);
      // Only show non-checked-in tickets that aren't already listed
      const listedTicketIds = new Set(my.filter(l => l.status === 'active').map(l => l.ticketId));
      setMyTickets(tickets.filter(t => !t.checkedIn && !listedTicketIds.has(t.id)));
    } catch (e) {
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Sell Ticket ──────────────────────────────────────────────────────────

  const handleSell = async () => {
    if (!sellForm.ticketId || !sellForm.resalePrice) return;
    const price = parseFloat(sellForm.resalePrice);
    if (isNaN(price) || price <= 0) {
      setPriceError('Price must be greater than $0.00');
      return;
    }
    const maxPrice = selectedTicket ? (selectedTicket.price || selectedTicket.priceCents / 100 || Infinity) * 1.1 : Infinity;
    if (price > maxPrice) {
      setPriceError(`Max allowed: ${formatCurrency(maxPrice)} (110% of original)`);
      return;
    }
    setPriceError('');
    setFormLoading(true);
    try {
      const listing = await createResaleListing({
        ticketId: sellForm.ticketId,
        resalePrice: parseFloat(sellForm.resalePrice),
        sellerNote: sellForm.sellerNote || undefined,
      });
      setMyListings(prev => [listing, ...prev]);
      setListings(prev => [listing, ...prev]);
      setMyTickets(prev => prev.filter(t => t.id !== sellForm.ticketId));
      setShowSellModal(false);
      setSellForm({ ticketId: '', resalePrice: '', sellerNote: '' });
      setSelectedTicket(null);
      showSuccess('Your ticket is now listed for resale!');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to list ticket');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Purchase ─────────────────────────────────────────────────────────────

  const handlePurchase = async () => {
    if (!purchaseTarget) return;
    setPurchaseLoading(true);
    try {
      const sold = await purchaseResaleListing(purchaseTarget.id);
      setListings(prev => prev.filter(l => l.id !== purchaseTarget.id));
      setPurchaseSuccess({
        ticketNumber: sold.ticketNumber || purchaseTarget.ticketNumber || '',
        eventTitle: purchaseTarget.eventTitle || 'Event',
        price: purchaseTarget.resalePrice,
      });
      setPurchaseTarget(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to complete purchase');
      setPurchaseTarget(null);
    } finally {
      setPurchaseLoading(false);
    }
  };

  // ─── Cancel Listing ───────────────────────────────────────────────────────

  const handleCancel = async (listingId: string) => {
    setCancellingId(listingId);
    try {
      await cancelResaleListing(listingId);
      setMyListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'cancelled' as const } : l));
      setListings(prev => prev.filter(l => l.id !== listingId));
      showSuccess('Listing cancelled. Your ticket is yours again.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to cancel listing');
    } finally {
      setCancellingId(null);
    }
  };

  const onTicketSelect = (ticketId: string) => {
    const t = myTickets.find(t => t.id === ticketId);
    setSelectedTicket(t || null);
    setSellForm(f => ({ ...f, ticketId }));
  };

  // Filter and sort browse listings
  const filteredListings = listings
    .filter(l => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (l.eventTitle || '').toLowerCase().includes(q) ||
        (l.ticketTypeName || '').toLowerCase().includes(q) ||
        (l.sellerName || '').toLowerCase().includes(q) ||
        (l.eventLocation || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.resalePrice || 0) - (b.resalePrice || 0);
      if (sortBy === 'price-high') return (b.resalePrice || 0) - (a.resalePrice || 0);
      return 0; // newest = default API order
    });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-pulse">
              <div className="h-2 bg-gray-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                  <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2 mt-2" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-24" />
                  <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Resale Market</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Buy verified resale tickets or sell yours at a fair price
          </p>
        </div>
        <Button
          onClick={() => setShowSellModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
          disabled={myTickets.length === 0}
        >
          <Tag className="w-4 h-4 mr-2" />
          List a Ticket
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm">{successMsg}</span>
        </div>
      )}

      {/* Platform Policy Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-100 dark:border-violet-800 rounded-xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">Fair Resale Policy</p>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
            Resale prices are capped at 110% of the original price · 5% platform fee applies · All transactions are protected
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <button
          onClick={() => setTab('browse')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'browse'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Store className="w-4 h-4 inline mr-2" />
          Browse Listings
          <span className="ml-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
            {listings.length}
          </span>
        </button>
        <button
          onClick={() => setTab('my-listings')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'my-listings'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          My Listings
          <span className="ml-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
            {myListings.length}
          </span>
        </button>
      </div>

      {/* Browse Tab */}
      {tab === 'browse' && (
        <>
          {/* Search & Sort Bar */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by event, type, seller..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <button
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
              title="Refresh listings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No Matching Listings' : 'No Resale Listings'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search terms or clear the filter.'
                  : 'No tickets are currently listed for resale. Check back later or list your own.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredListings.map(listing => (
                <div key={listing.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-violet-500/5 transition-shadow">
                  {/* Card top gradient */}
                  <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                  <div className="p-5">
                    {/* Event Info */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {listing.eventTitle || 'Event Ticket'}
                      </h3>
                      {listing.ticketTypeName && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">{listing.ticketTypeName}</p>
                      )}
                      <div className="flex flex-col gap-1 mt-2">
                        {listing.eventDate && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(listing.eventDate)}
                          </div>
                        )}
                        {listing.eventLocation && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="line-clamp-1">{listing.eventLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(listing.resalePrice)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Original: {formatCurrency(listing.originalPrice)}
                            {listing.originalPrice > 0 && listing.resalePrice > listing.originalPrice && (
                              <span className="ml-1 text-orange-500">
                                (+{Math.round(((listing.resalePrice - listing.originalPrice) / listing.originalPrice) * 100)}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[listing.status]}`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>

                    {/* Seller note */}
                    {listing.sellerNote && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4 line-clamp-2">
                        &ldquo;{listing.sellerNote}&rdquo;
                      </p>
                    )}

                    {/* Ticket ID */}
                    {listing.ticketNumber && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-3">
                        #{listing.ticketNumber}
                      </p>
                    )}

                    {/* Seller info & CTA */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {listing.sellerName || 'Verified Seller'}
                      </p>
                      {user && listing.sellerId !== user.id && listing.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => setPurchaseTarget(listing)}
                          className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                          Buy Now
                        </Button>
                      )}
                      {!user && (
                        <a href="/login" className="text-xs text-violet-600 hover:underline">Log in to buy</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Listings Tab */}
      {tab === 'my-listings' && (
        <>
          {myListings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Listings Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                List a ticket you can no longer use and let someone else enjoy the event.
              </p>
              <Button
                onClick={() => setShowSellModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white"
                disabled={myTickets.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                {myTickets.length === 0 ? 'No available tickets' : 'List a Ticket'}
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Payout</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {myListings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {listing.eventTitle || 'Event Ticket'}
                        </p>
                        {listing.eventDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(listing.eventDate)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-700 dark:text-gray-300">{listing.ticketTypeName || 'General'}</p>
                        {listing.ticketNumber && (
                          <p className="text-xs text-gray-400 font-mono">#{listing.ticketNumber}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(listing.resalePrice)}</p>
                        <p className="text-xs text-gray-500">fee: {formatCurrency(listing.platformFee)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(listing.sellerPayout)}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[listing.status]}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {listing.status === 'active' && (
                          <button
                            onClick={() => handleCancel(listing.id)}
                            disabled={cancellingId === listing.id}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === listing.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        {listing.status === 'sold' && (
                          <span className="text-xs text-gray-400">Sold {listing.soldAt ? formatDate(listing.soldAt) : ''}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── List Ticket Modal ─────────────────────────────────────────────────── */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">List Ticket for Resale</h2>
              <button onClick={() => setShowSellModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-8">
                <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You have no available tickets to list. Tickets that are already checked-in or listed cannot be resold.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => setShowSellModal(false)}>Close</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Ticket *
                  </label>
                  <select
                    value={sellForm.ticketId}
                    onChange={e => onTicketSelect(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="">Choose a ticket...</option>
                    {myTickets.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.ticketNumber || t.ticketCode || t.id.slice(0, 8)} — {t.ticketTypeName || 'General'} {t.eventTitle ? `(${t.eventTitle})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Resale Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={sellForm.resalePrice}
                      onChange={e => { setSellForm(f => ({ ...f, resalePrice: e.target.value })); setPriceError(''); }}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                  {priceError ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{priceError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Max allowed: 110% of original price · Platform fee: 5%
                      {sellForm.resalePrice && (
                        <> · Your payout: <strong className="text-green-600">{formatCurrency(parseFloat(sellForm.resalePrice) * 0.95)}</strong></>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Note to Buyer (optional)
                  </label>
                  <textarea
                    value={sellForm.sellerNote}
                    onChange={e => setSellForm(f => ({ ...f, sellerNote: e.target.value }))}
                    placeholder="e.g. Can't make it due to travel. Great event, don't miss it!"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowSellModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={handleSell}
                    disabled={formLoading || !sellForm.ticketId || !sellForm.resalePrice}
                  >
                    {formLoading ? 'Listing...' : 'List for Sale'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Purchase Success Modal ──────────────────────────────────────────── */}
      {purchaseSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Purchase Complete!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Your ticket for <strong>{purchaseSuccess.eventTitle}</strong> has been transferred to your account.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-4">
              Ticket #{purchaseSuccess.ticketNumber}
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">
              {formatCurrency(purchaseSuccess.price)}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPurchaseSuccess(null)}>
                Continue Browsing
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => { setPurchaseSuccess(null); window.location.href = '/dashboard/tickets'; }}
              >
                View My Tickets
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Purchase Confirm Modal ───────────────────────────────────────────── */}
      {purchaseTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Purchase</h2>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Event</span>
                <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%] line-clamp-1">
                  {purchaseTarget.eventTitle}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Ticket type</span>
                <span className="font-medium text-gray-900 dark:text-white">{purchaseTarget.ticketTypeName || 'General'}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-slate-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(purchaseTarget.resalePrice)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              By purchasing, you agree to the resale terms. The ticket will be transferred to your account immediately.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPurchaseTarget(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handlePurchase}
                disabled={purchaseLoading}
              >
                {purchaseLoading ? 'Processing...' : `Buy for ${formatCurrency(purchaseTarget.resalePrice)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
