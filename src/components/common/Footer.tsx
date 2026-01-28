'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Footer component with links and information
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold" aria-hidden="true">
                E
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                EventHub
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The ultimate event management and ticketing platform for organizers and attendees.
            </p>
          </div>

          {/* Product links */}
          <nav aria-label="Product links">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Product
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </nav>

          {/* For Organizers */}
          <nav aria-label="Organizer links">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              For Organizers
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Organizer Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal and Contact */}
          <nav aria-label="Legal links">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          {/* Social links */}
          <div className="flex justify-center gap-6 mb-6">
            <a
              href="#"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-3 1" />
              </svg>
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              &copy; {currentYear} EventHub. All rights reserved. | Made with{' '}
              <span className="text-red-500">❤</span> for event organizers and attendees.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
