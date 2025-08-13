'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PilotFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  zipCode: string;
  pilotLicenseNumber: string;
  pilotLicenseState: string;
  // File uploads
  governmentIdFront: File | null;
  governmentIdBack: File | null;
  faaPilotLicense: File | null;
}

export default function PilotRegister() {
  const [formData, setFormData] = useState<PilotFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    pilotLicenseNumber: '',
    pilotLicenseState: '',
    governmentIdFront: null,
    governmentIdBack: null,
    faaPilotLicense: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof PilotFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof PilotFormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.governmentIdFront || !formData.governmentIdBack || !formData.faaPilotLicense) {
      setError('Please upload all required documents');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('password', formData.password);
      submitData.append('zipCode', formData.zipCode);
      submitData.append('pilotLicenseNumber', formData.pilotLicenseNumber);
      submitData.append('pilotLicenseState', formData.pilotLicenseState);
      
      if (formData.governmentIdFront) {
        submitData.append('governmentIdFront', formData.governmentIdFront);
      }
      if (formData.governmentIdBack) {
        submitData.append('governmentIdBack', formData.governmentIdBack);
      }
      if (formData.faaPilotLicense) {
        submitData.append('faaPilotLicense', formData.faaPilotLicense);
      }

      const response = await fetch('/api/pilot/register', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/pilot/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="panel pad" style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', textAlign: 'center' }}>
          <h2 style={{ color: '#0c4a6e', margin: '0 0 16px 0' }}>🎉 Registration Successful!</h2>
          <p style={{ color: '#0369a1', margin: '0 0 16px 0' }}>
            Your pilot application has been submitted and is under review.
          </p>
          <p style={{ color: '#0369a1', margin: 0 }}>
            You&apos;ll receive an email confirmation shortly. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="container">
        <h1>Pilot Registration</h1>
        
        <form onSubmit={handleSubmit} className="panel pad">
          <h2>Personal Information</h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="firstName" className="form-label">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="form-label">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="form-label">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <h2 style={{ marginTop: 32 }}>Pilot License Information</h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="pilotLicenseNumber" className="form-label">FAA Pilot License Number *</label>
              <input
                type="text"
                id="pilotLicenseNumber"
                value={formData.pilotLicenseNumber}
                onChange={(e) => handleInputChange('pilotLicenseNumber', e.target.value)}
                className="form-input"
                required
                placeholder="e.g., 123456789"
              />
            </div>

            <div>
              <label htmlFor="pilotLicenseState" className="form-label">License State *</label>
              <input
                type="text"
                id="pilotLicenseState"
                value={formData.pilotLicenseState}
                onChange={(e) => handleInputChange('pilotLicenseState', e.target.value)}
                className="form-input"
                required
                placeholder="e.g., CA"
              />
            </div>
          </div>

          <h2 style={{ marginTop: 32 }}>Required Documents</h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="governmentIdFront" className="form-label">
                Government ID - Front * ⚠️
              </label>
              <input
                type="file"
                id="governmentIdFront"
                onChange={(e) => handleFileChange('governmentIdFront', e.target.files?.[0] || null)}
                className="form-input"
                accept="image/*,.pdf"
                required
              />
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: 4 }}>
                Driver&apos;s license, passport, or state ID
              </div>
            </div>

            <div>
              <label htmlFor="governmentIdBack" className="form-label">
                Government ID - Back * ⚠️
              </label>
              <input
                type="file"
                id="governmentIdBack"
                onChange={(e) => handleFileChange('governmentIdBack', e.target.files?.[0] || null)}
                className="form-input"
                accept="image/*,.pdf"
                required
              />
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: 4 }}>
                Back side of your government ID
              </div>
            </div>

            <div>
              <label htmlFor="faaPilotLicense" className="form-label">
                FAA Pilot License * ⚠️
              </label>
              <input
                type="file"
                id="faaPilotLicense"
                onChange={(e) => handleFileChange('faaPilotLicense', e.target.files?.[0] || null)}
                className="form-input"
                accept="image/*,.pdf"
                required
              />
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: 4 }}>
                Your current FAA pilot certificate
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: 32 }}>Account Security</h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="password" className="form-label">Password *</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="form-input"
                required
                minLength={8}
              />
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: 4 }}>
                Minimum 8 characters
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', padding: 12, borderRadius: 4, marginTop: 16 }}>
              <p style={{ color: '#c33', margin: 0 }}>Error: {error}</p>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Account...' : 'Create Pilot Account'}
            </button>
          </div>

          <p style={{ fontSize: '0.8em', color: '#666', marginTop: 16, textAlign: 'center' }}>
            ⚠️ All documents will be securely stored and used only for verification purposes.
            Your application will be reviewed by our admin team within 24-48 hours.
          </p>
        </form>
      </div>
    </main>
  );
}


