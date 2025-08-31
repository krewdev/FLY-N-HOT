'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  type: 'customer' | 'pilot';
  avatar?: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Albuquerque Balloon Fiesta, NM",
    rating: 5,
    comment: "Absolutely magical experience! The app made it so easy to find a last-minute spot. We got notified about a cancellation and were in the air within 2 hours. The pilot was amazing and the views were breathtaking!",
    type: 'customer',
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Mike Chen",
    location: "Great Reno Balloon Race, NV",
    rating: 5,
    comment: "Found a great deal through the app and the pilot was super professional. The whole process was seamless from booking to takeoff. Can't wait to do it again next year!",
    type: 'customer',
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "Colorado Balloon Classic, CO",
    rating: 5,
    comment: "The weight requirement feature is brilliant - made me feel safe knowing the balloon wouldn't be overloaded. The pilot was experienced and the flight was smooth as silk.",
    type: 'customer',
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Plano Balloon Festival, TX",
    rating: 5,
    comment: "Got a last-minute notification about an opening and jumped on it! The app is so user-friendly and the booking process was quick. The sunrise flight was absolutely spectacular.",
    type: 'customer',
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Lisa Wang",
    location: "QuickChek New Jersey Festival, NJ",
    rating: 5,
    comment: "Perfect for spontaneous adventures! The app found us a flight on short notice and the pilot was incredibly knowledgeable about the area. The views of the fall foliage were incredible.",
    type: 'customer',
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Captain James Wilson",
    location: "Professional Balloon Pilot",
    rating: 5,
    comment: "This app has been a game-changer for my business! I can fill last-minute cancellations in minutes instead of hours. The weight verification feature gives me confidence in passenger safety.",
    type: 'pilot',
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 7,
    name: "Captain Maria Garcia",
    location: "Festival Balloon Pilot",
    rating: 5,
    comment: "Finding passengers for short-notice flights used to be impossible. Now I can post availability and have the app notify interested people instantly. It's revolutionized how I operate during busy festival seasons.",
    type: 'pilot',
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
  }
];

export default function CustomerReviews() {
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToReview = (index: number) => {
    setCurrentReview(index);
  };

  const goToPrevious = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db' }}>
        ★
      </span>
    ));
  };

  return (
    <div className="section">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: 32, background: 'linear-gradient(135deg, #8b5cf6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>🎈 What Our Users Say</h2>
        
        <div className="panel pad" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              <img
                src={reviews[currentReview].avatar}
                alt={reviews[currentReview].name}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #e5e7eb'
                }}
              />
            </div>

            {/* Review Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>{reviews[currentReview].name}</h4>
                {reviews[currentReview].type === 'pilot' && (
                  <span style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.75em',
                    fontWeight: 'bold'
                  }}>
                    PILOT
                  </span>
                )}
              </div>
              
              <div style={{ color: '#6b7280', fontSize: '0.9em', marginBottom: 8 }}>
                {reviews[currentReview].location}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                {renderStars(reviews[currentReview].rating)}
              </div>
              
                             <blockquote style={{
                 fontStyle: 'italic',
                 fontSize: '1.1em',
                 lineHeight: 1.6,
                 color: '#374151',
                 margin: 0,
                 padding: 0
               }}>
                 &ldquo;{reviews[currentReview].comment}&rdquo;
               </blockquote>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6b7280'
            }}
          >
            ‹
          </button>
          
          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6b7280'
            }}
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 24
          }}>
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentReview ? '#3b82f6' : '#e5e7eb',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid" style={{ marginTop: 32 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="hero-title">5,000+</div>
            <div className="muted">Happy Passengers</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="hero-title">200+</div>
            <div className="muted">Verified Pilots</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="hero-title">50+</div>
            <div className="muted">Balloon Festivals</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="hero-title">4.9★</div>
            <div className="muted">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}