'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, MapPin } from 'lucide-react';

interface LocationPreferenceComponentProps {
  onSave?: (location: LocationPreference) => void;
  initialLocation?: LocationPreference;
}

interface LocationPreference {
  latitude: number;
  longitude: number;
  radius: number;
}

export const LocationPreferenceComponent: React.FC<LocationPreferenceComponentProps> = ({
  onSave,
  initialLocation,
}) => {
  const [latitude, setLatitude] = useState(initialLocation?.latitude || 0);
  const [longitude, setLongitude] = useState(initialLocation?.longitude || 0);
  const [radius, setRadius] = useState(initialLocation?.radius || 50);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const MIN_RADIUS = 1;
  const MAX_RADIUS = 500;

  const validateInputs = (): boolean => {
    if (latitude < -90 || latitude > 90) {
      setMessage({ type: 'error', text: 'Latitude must be between -90 and 90' });
      return false;
    }
    if (longitude < -180 || longitude > 180) {
      setMessage({ type: 'error', text: 'Longitude must be between -180 and 180' });
      return false;
    }
    if (radius < MIN_RADIUS || radius > MAX_RADIUS) {
      setMessage({
        type: 'error',
        text: `Radius must be between ${MIN_RADIUS} and ${MAX_RADIUS} km`,
      });
      return false;
    }
    return true;
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setUseCurrentLocation(true);
        setLoading(false);
      },
      (error) => {
        setMessage({ type: 'error', text: `Failed to get location: ${error.message}` });
        setLoading(false);
      }
    );
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/user-profile/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          radius,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location preference');
      }

      setMessage({
        type: 'success',
        text: 'Location preference saved successfully!',
      });
      onSave?.({ latitude, longitude, radius });

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
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="h-6 w-6" />
        Location Preference
      </h2>

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

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              min="-90"
              max="90"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              placeholder="e.g., 40.7128"
            />
            <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              min="-180"
              max="180"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              placeholder="e.g., -74.0060"
            />
            <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
          </div>
        </div>

        <div>
          <Label htmlFor="radius">Search Radius (km)</Label>
          <Input
            id="radius"
            type="number"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            placeholder="50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Range: {MIN_RADIUS} to {MAX_RADIUS} km (default: 50 km)
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900 font-semibold mb-2">Current Settings:</p>
        <p className="text-sm text-blue-800">
          Latitude: {latitude.toFixed(4)} | Longitude: {longitude.toFixed(4)} | Radius: {radius} km
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleGetCurrentLocation}
          variant="outline"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Getting location...' : 'Use Current Location'}
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? 'Saving...' : 'Save Location'}
        </Button>
      </div>
    </Card>
  );
};

export default LocationPreferenceComponent;

