'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FlightFormData {
  launchLocation: {
    city: string;
    state: string;
    zipCode: string;
    address: string;
  };
  meetupTimestamp: string;
  estimatedDurationMinutes: number;
  pricePerSeat: number;
  totalSeats: number;
  description: string;
}

export default function CreateFlight() {
  const [formData, setFormData] = useState<FlightFormData>({
    launchLocation: {
      city: '',
      state: '',
      zipCode: '',
      address: ''
    },
    meetupTimestamp: '',
    estimatedDurationMinutes: 60,
    pricePerSeat: 0,
    totalSeats: 1,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FlightFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pilotIdDev = localStorage.getItem('pilotId_dev');
      const qs = pilotIdDev ? `?pilotId=${encodeURIComponent(pilotIdDev)}` : '';
      const response = await fetch(`/api/pilots/flights${qs}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pilotToken') || ''}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create flight');
      }

      const result = await response.json();
      alert('Flight created successfully!');
      router.push('/pilot/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flight');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return (
      formData.launchLocation.city &&
      formData.launchLocation.state &&
      formData.launchLocation.zipCode &&
      formData.meetupTimestamp &&
      formData.pricePerSeat > 0 &&
      formData.totalSeats > 0 &&
      formData.estimatedDurationMinutes > 0
    );
  };

  return (
    <main>
      <div className="container">
        <h1>Create New Flight</h1>
        
        <form onSubmit={handleSubmit} className="panel pad">
          <h2>Flight Details</h2>
          
          {/* Launch Location */}
          <div style={{ marginBottom: 24 }}>
            <h3>Launch Location</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="city" className="form-label">City *</label>
              <input
                type="text"
                id="city"
                value={formData.launchLocation.city}
                onChange={(e) => handleInputChange('launchLocation.city', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="state" className="form-label">State *</label>
              <input
                type="text"
                id="state"
                value={formData.launchLocation.state}
                onChange={(e) => handleInputChange('launchLocation.state', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="zipCode" className="form-label">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                value={formData.launchLocation.zipCode}
                onChange={(e) => handleInputChange('launchLocation.zipCode', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="address" className="form-label">Full Address</label>
              <textarea
                id="address"
                value={formData.launchLocation.address}
                onChange={(e) => handleInputChange('launchLocation.address', e.target.value)}
                className="form-input"
                rows={3}
                placeholder="Street address, landmarks, or meeting point details"
              />
            </div>
          </div>

          {/* Flight Details */}
          <div style={{ marginBottom: 24 }}>
            <h3>Flight Information</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="meetupTimestamp" className="form-label">Meetup Date & Time *</label>
              <input
                type="datetime-local"
                id="meetupTimestamp"
                value={formData.meetupTimestamp}
                onChange={(e) => handleInputChange('meetupTimestamp', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="estimatedDurationMinutes" className="form-label">Estimated Duration (minutes) *</label>
              <input
                type="number"
                id="estimatedDurationMinutes"
                value={formData.estimatedDurationMinutes}
                onChange={(e) => handleInputChange('estimatedDurationMinutes', parseInt(e.target.value))}
                className="form-input"
                min="15"
                max="480"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="pricePerSeat" className="form-label">Price per Seat ($) *</label>
              <input
                type="number"
                id="pricePerSeat"
                value={formData.pricePerSeat}
                onChange={(e) => handleInputChange('pricePerSeat', parseFloat(e.target.value))}
                className="form-input"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="totalSeats" className="form-label">Total Seats Available *</label>
              <input
                type="number"
                id="totalSeats"
                value={formData.totalSeats}
                onChange={(e) => handleInputChange('totalSeats', parseInt(e.target.value))}
                className="form-input"
                min="1"
                max="20"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="description" className="form-label">Flight Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-input"
                rows={4}
                placeholder="Describe the flight experience, special features, or any important details passengers should know..."
              />
            </div>
          </div>

          {/* Platform Fee Notice */}
          <div className="panel" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', marginBottom: 24 }}>
            <div style={{ padding: 16 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Platform Fee</h4>
              <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                A 10% platform fee will be automatically deducted from each booking to cover operational costs.
                You&apos;ll receive 90% of the payment directly to your Stripe account.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="panel" style={{ backgroundColor: '#fee', border: '1px solid #fcc', marginBottom: 16 }}>
              <p style={{ color: '#c33', margin: 0 }}>Error: {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              type="submit"
              disabled={!validateForm() || loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating Flight...' : 'Create Flight'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/pilot/dashboard')}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}