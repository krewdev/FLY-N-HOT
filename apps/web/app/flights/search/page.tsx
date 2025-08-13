'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Flight {
  flightId: string;
  launchLocation: {
    city: string;
    state: string;
    zipCode: string;
    address?: string;
  };
  meetupTimestamp: string;
  estimatedDurationMinutes: number;
  pricePerSeat: number;
  totalSeats: number;
  seatsReserved: number;
  description?: string;
  status: string;
  pilot: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface SearchFilters {
  location: string;
  dateFrom: string;
  dateTo: string;
  maxPrice: number;
  minSeats: number;
}

export default function FlightSearch() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    dateFrom: '',
    dateTo: '',
    maxPrice: 1000,
    minSeats: 1
  });

  const loadFlights = useCallback(async () => {
    try {
      const response = await fetch('/api/flights');
      
      if (!response.ok) {
        throw new Error('Failed to load flights');
      }

      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError('Failed to load flights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = flights.filter(flight => {
      // Location filter
      if (filters.location && !flight.launchLocation.city.toLowerCase().includes(filters.location.toLowerCase()) &&
          !flight.launchLocation.state.toLowerCase().includes(filters.location.toLowerCase()) &&
          !flight.launchLocation.zipCode.includes(filters.location)) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const flightDate = new Date(flight.meetupTimestamp);
        const fromDate = new Date(filters.dateFrom);
        if (flightDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const flightDate = new Date(flight.meetupTimestamp);
        const toDate = new Date(filters.dateTo);
        if (flightDate > toDate) return false;
      }

      // Price filter
      if (flight.pricePerSeat > filters.maxPrice) {
        return false;
      }

      // Available seats filter
      const availableSeats = flight.totalSeats - flight.seatsReserved;
      if (availableSeats < filters.minSeats) {
        return false;
      }

      // Only show upcoming flights
      return flight.status === 'UPCOMING';
    });

    setFilteredFlights(filtered);
  }, [filters, flights]);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      dateFrom: '',
      dateTo: '',
      maxPrice: 1000,
      minSeats: 1
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="panel pad">
          <p>Loading flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="panel pad" style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}>
          <p style={{ color: '#c33', margin: 0 }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="container">
        <h1>Find Your Perfect Flight</h1>
        
        {/* Search Filters */}
        <div className="panel pad" style={{ marginBottom: 24 }}>
          <h2>Search Filters</h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                id="location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="form-input"
                placeholder="City, state, or ZIP code"
              />
            </div>

            <div>
              <label htmlFor="dateFrom" className="form-label">From Date</label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="dateTo" className="form-label">To Date</label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="maxPrice" className="form-label">Max Price per Seat</label>
              <input
                type="number"
                id="maxPrice"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                className="form-input"
                min="0"
                step="10"
              />
            </div>

            <div>
              <label htmlFor="minSeats" className="form-label">Min Available Seats</label>
              <input
                type="number"
                id="minSeats"
                value={filters.minSeats}
                onChange={(e) => handleFilterChange('minSeats', parseInt(e.target.value))}
                className="form-input"
                min="1"
                max="20"
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button onClick={clearFilters} className="btn btn-ghost">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div style={{ marginBottom: 16 }}>
          <h2>Available Flights</h2>
          <p className="muted">
            Found {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} matching your criteria
          </p>
        </div>

        {/* Flight Results */}
        {filteredFlights.length === 0 ? (
          <div className="panel pad">
            <p>No flights match your search criteria.</p>
            <p className="muted">Try adjusting your filters or check back later for new flights.</p>
          </div>
        ) : (
          <div className="grid">
            {filteredFlights.map((flight) => (
              <div key={flight.flightId} className="card">
                <h4>Flight to {flight.launchLocation.city}, {flight.launchLocation.state}</h4>
                
                <div className="muted">
                  {formatDate(flight.meetupTimestamp)}
                </div>
                
                <div className="muted">
                  Duration: {flight.estimatedDurationMinutes} minutes
                </div>
                
                <div className="row">
                  <span className="muted">Price per seat:</span>
                  <span className="hero-title">{formatPrice(flight.pricePerSeat)}</span>
                </div>
                
                <div className="row">
                  <span className="muted">Available seats:</span>
                  <span>{flight.totalSeats - flight.seatsReserved} of {flight.totalSeats}</span>
                </div>
                
                <div className="row">
                  <span className="muted">Pilot:</span>
                  <span>{flight.pilot.user.firstName} {flight.pilot.user.lastName}</span>
                </div>
                
                {flight.description && (
                  <div className="muted" style={{ marginTop: 8 }}>
                    {flight.description}
                  </div>
                )}
                
                {flight.launchLocation.address && (
                  <div className="muted" style={{ marginTop: 8 }}>
                    <strong>Meeting Point:</strong> {flight.launchLocation.address}
                  </div>
                )}

                <div className="sp" />
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link 
                    href={`/flights/${flight.flightId}`}
                    className="btn btn-primary"
                  >
                    View Details & Book
                  </Link>
                  
                  <Link 
                    href={`/flights/${flight.flightId}/map`}
                    className="btn btn-ghost"
                  >
                    View on Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscribe to Notifications */}
        <div className="section">
          <div className="panel pad" style={{ textAlign: 'center' }}>
            <h3>Don&apos;t Miss Out!</h3>
            <p>Subscribe to get notified about new flights in your area.</p>
            <Link href="/notify-signup" className="btn btn-primary">
              Subscribe to Notifications
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}