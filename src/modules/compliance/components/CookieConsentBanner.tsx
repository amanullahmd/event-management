'use client';

import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'pulsarflow_cookie_consent';

interface CookiePreferences {
  necessary: boolean;   // always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

type ConsentState = 'pending' | 'accepted' | 'declined' | 'customized';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // Slight delay so it doesn't flash on initial render
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const saveConsent = (state: ConsentState, prefs: CookiePreferences) => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({ state, preferences: prefs, timestamp: Date.now() })
      );
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    const all: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(all);
    saveConsent('accepted', all);
  };

  const handleDeclineAll = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(minimal);
    saveConsent('declined', minimal);
  };

  const handleSavePreferences = () => {
    saveConsent('customized', preferences);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40">
        {!showDetails ? (
          /* ── Compact banner ── */
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">🍪</span>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  We use cookies
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  PulsarFlow uses cookies to improve your experience, analyze site traffic, and
                  personalize content. By clicking &ldquo;Accept All&rdquo; you consent to our use
                  of cookies.{' '}
                  <a
                    href="/privacy"
                    className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
              >
                Manage preferences
              </button>
              <button
                onClick={handleDeclineAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
              >
                Decline all
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          /* ── Detailed preferences ── */
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">🍪</span>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h2>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                aria-label="Back to summary"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {/* Necessary */}
              <CookieCategory
                title="Strictly Necessary"
                description="Required for the site to function. Cannot be disabled."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              {/* Analytics */}
              <CookieCategory
                title="Analytics"
                description="Help us understand how visitors interact with the site by collecting anonymous data."
                checked={preferences.analytics}
                disabled={false}
                onChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
              />
              {/* Marketing */}
              <CookieCategory
                title="Marketing"
                description="Used to track visitors across websites to display relevant advertisements."
                checked={preferences.marketing}
                disabled={false}
                onChange={(v) => setPreferences((p) => ({ ...p, marketing: v }))}
              />
              {/* Personalization */}
              <CookieCategory
                title="Personalization"
                description="Allow us to remember your preferences and personalize your event recommendations."
                checked={preferences.personalization}
                disabled={false}
                onChange={(v) => setPreferences((p) => ({ ...p, personalization: v }))}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
              <a
                href="/privacy"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Privacy Policy
              </a>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDeclineAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
                >
                  Decline all
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  Accept all
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 rounded-lg transition-colors shadow-sm"
                >
                  Save preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CookieCategoryProps {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}

const CookieCategory: React.FC<CookieCategoryProps> = ({
  title,
  description,
  checked,
  disabled,
  onChange,
}) => (
  <div className={`flex items-start gap-4 p-3 rounded-xl border ${
    disabled
      ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'
      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors'
  }`}>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
    </div>
    <div className="flex-shrink-0 pt-0.5">
      {disabled ? (
        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
          Always on
        </span>
      ) : (
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
            checked
              ? 'bg-indigo-600 dark:bg-indigo-500'
              : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      )}
    </div>
  </div>
);

export default CookieConsentBanner;
