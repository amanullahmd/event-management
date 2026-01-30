'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Users, Search, Filter, X, ChevronDown, Grid3X3, List, Heart } from 'lucide-react';

const ITEMS_PER_PAGE = 12;
const CATEGORIES = ['All', 'Music', 'Business', 'Education', 'Arts', 'Health', 'Food', 'Sports', 'Technology'];
const DATE_FILTERS = [
  { value: '', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
];

interface EventsPageClientProps {
  initialEvents: Event[];
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = event.name.toLowerCase().includes(query) || event.description.toLowerCase().includes(query) || event.category.toLowerCase().includes(query) || event.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (selectedCategory !== 'All' && event.category !== selectedCategory) return false;
      if (selectedDate) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        switch (selectedDate) {
          case 'today': { const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); if (eventDate < today || eventDate >= tomorrow) return false; break; }
          case 'tomorrow': { const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 1); if (eventDate < tomorrow || eventDate >= dayAfter) return false; break; }
          case 'this-week': { const endOfWeek = new Date(today); endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay())); if (eventDate < today || eventDate > endOfWeek) return false; break; }
          case 'this-month': { const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); if (eventDate < today || eventDate > endOfMonth) return false; break; }
        }
      }
      return true;
    });
  }, [initialEvents, searchQuery, selectedCategory, selectedDate]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, selectedDate]);

  const handleClearFilters = useCallback(() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDate(''); }, []);
  const toggleLike = (eventId: string) => { setLikedEvents(prev => { const newSet = new Set(prev); if (newSet.has(eventId)) newSet.delete(eventId); else newSet.add(eventId); return newSet; }); };
  const formatDate = useCallback((date: Date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), []);
  const formatTime = useCallback((date: Date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }), []);
  const getAvailableTickets = useCallback((event: Event) => event.ticketTypes.reduce((total, tt) => total + (tt.quantity - tt.sold), 0), []);
  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedDate;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-12 pl-4 pr-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {DATE_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`h-12 px-4 border-gray-200 dark:border-slate-700 ${showFilters ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-600' : ''}`}>
                <Filter className="w-4 h-4 mr-2" />Filters{hasActiveFilters && <span className="ml-2 w-2 h-2 bg-violet-600 rounded-full" />}
              </Button>
              <div className="hidden sm:flex border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-3 ${viewMode === 'grid' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}><Grid3X3 className="w-5 h-5" /></button>
                <button onClick={() => setViewMode('list')} className={`p-3 ${viewMode === 'list' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>{category}</button>)}
              </div>
            </div>
          )}
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory !== 'All' ? `${selectedCategory} Events` : 'All Events'}</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredEvents.length} events found</p></div>
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-violet-600 dark:text-violet-400">Clear filters</Button>}
        </div>
        {paginatedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6"><Search className="w-8 h-8 text-gray-400" /></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Try adjusting your search or filters.</p>
            <Button onClick={handleClearFilters} className="bg-violet-600 hover:bg-violet-700 text-white">Clear Filters</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group block">
                <Card className="overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                  <div className="h-44 bg-gradient-to-br from-violet-500 to-fuchsia-500 relative">
                    <button onClick={(e) => { e.preventDefault(); toggleLike(event.id); }} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${likedEvents.has(event.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'}`}><Heart className={`w-4 h-4 ${likedEvents.has(event.id) ? 'fill-current' : ''}`} /></button>
                    <div className="absolute bottom-3 left-3"><div className="bg-white dark:bg-slate-900 rounded-lg px-3 py-1.5 shadow-lg"><p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{formatDate(event.date)}</p></div></div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400">{event.category}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{event.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3"><MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" /><span className="truncate">{event.location.split(',')[0]}</span></div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700"><span className="font-semibold text-gray-900 dark:text-white">${Math.min(...event.ticketTypes.map((t) => t.price))}</span><span className="text-xs text-gray-500 dark:text-gray-400 flex items-center"><Users className="w-3.5 h-3.5 mr-1" />{getAvailableTickets(event)} left</span></div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group block">
                <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md transition-all">
                  <div className="flex-shrink-0 w-16 text-center"><div className="bg-violet-100 dark:bg-violet-900/30 rounded-xl p-2"><p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p><p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{new Date(event.date).getDate()}</p></div></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0"><span className="text-xs font-medium text-violet-600 dark:text-violet-400">{event.category}</span><h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">{event.name}</h3><div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400"><span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatTime(event.date)}</span><span className="flex items-center truncate"><MapPin className="w-4 h-4 mr-1 flex-shrink-0" />{event.location.split(',')[0]}</span></div></div>
                      <div className="flex items-center gap-3"><div className="text-right"><p className="font-semibold text-gray-900 dark:text-white">From ${Math.min(...event.ticketTypes.map((t) => t.price))}</p><p className="text-xs text-gray-500 dark:text-gray-400">{getAvailableTickets(event)} tickets left</p></div><button onClick={(e) => { e.preventDefault(); toggleLike(event.id); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${likedEvents.has(event.id) ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 hover:text-red-500'}`}><Heart className={`w-5 h-5 ${likedEvents.has(event.id) ? 'fill-current' : ''}`} /></button></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-gray-200 dark:border-slate-700">Previous</Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => { let page = i + 1; if (totalPages > 5) { if (currentPage <= 3) page = i + 1; else if (currentPage >= totalPages - 2) page = totalPages - 4 + i; else page = currentPage - 2 + i; } return <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'border-gray-200 dark:border-slate-700'}>{page}</Button>; })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-gray-200 dark:border-slate-700">Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
