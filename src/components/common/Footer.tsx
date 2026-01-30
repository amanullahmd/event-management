'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Use EventHub': [
      { label: 'Find Events', href: '/events' },
      { label: 'Create Events', href: '/register' },
      { label: 'Pricing', href: '/' },
      { label: 'Event Planning', href: '/' },
    ],
    'Plan Events': [
      { label: 'Sell Tickets', href: '/register' },
      { label: 'Event Management', href: '/' },
      { label: 'Virtual Events', href: '/' },
      { label: 'QR Check-in', href: '/' },
    ],
    'Connect': [
      { label: 'Contact Support', href: '/' },
      { label: 'Help Center', href: '/' },
      { label: 'Community', href: '/' },
      { label: 'Blog', href: '/' },
    ],
  };

  return (
    <footer className="w-full bg-gray-900 text-gray-300" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="font-bold text-xl text-white">EventHub</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              The all-in-one event management platform. Create, promote, and sell tickets to your events with ease.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-label={`${title} links`}>
              <h3 className="font-semibold text-white mb-4 text-sm">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} EventHub. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
