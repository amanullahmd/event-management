'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InterestSelectionComponentProps {
  onSave?: (interests: string[]) => void;
  initialInterests?: string[];
}

const AVAILABLE_INTERESTS = [
  'Music',
  'Technology',
  'Sports',
  'Art',
  'Food',
  'Business',
  'Education',
  'Health',
  'Travel',
  'Entertainment',
  'Fashion',
  'Gaming',
  'Photography',
  'Networking',
  'Comedy',
  'Theater',
  'Dance',
  'Film',
  'Literature',
  'Science',
];

export const InterestSelectionComponent: React.FC<InterestSelectionComponentProps> = ({
  onSave,
  initialInterests = [],
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const MIN_INTERESTS = 5;
  const MAX_INTERESTS = 50;

  const filteredInterests = AVAILABLE_INTERESTS.filter((interest) =>
    interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      } else if (prev.length < MAX_INTERESTS) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (selectedInterests.length < MIN_INTERESTS) {
      setMessage({
        type: 'error',
        text: `Please select at least ${MIN_INTERESTS} interests`,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user-profile/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      if (!response.ok) {
        throw new Error('Failed to save interests');
      }

      setMessage({
        type: 'success',
        text: 'Interests saved successfully!',
      });
      onSave?.(selectedInterests);

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Select Your Interests</h2>
      <p className="text-gray-600 mb-6">
        Choose between {MIN_INTERESTS} and {MAX_INTERESTS} interests to get personalized recommendations.
      </p>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search interests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {filteredInterests.map((interest) => (
            <Badge
              key={interest}
              variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-2 text-sm"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          Selected: {selectedInterests.length} / {MAX_INTERESTS}
        </p>
        {selectedInterests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={loading || selectedInterests.length < MIN_INTERESTS}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save Interests'}
      </Button>
    </Card>
  );
};

export default InterestSelectionComponent;

