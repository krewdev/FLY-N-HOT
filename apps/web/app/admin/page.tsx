'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Pilot {
  pilotId: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    homeZipCode?: string;
    createdAt: string;
  };
  faaLicenseUrl?: string;
  officialIdUrl?: string;
  insuranceProofUrl?: string;
}

interface DashboardData {
  pendingPilots: number;
  totalPilots: number;
  totalFlights: number;
  totalBookings: number;
  recentAdminActions: any[];
}

export default function AdminPortal() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pendingPilots, setPendingPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
    loadPendingPilots();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    }
  };

  const loadPendingPilots = async () => {
    try {
      const response = await fetch('/api/admin/pilots/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load pending pilots');
      }

      const data = await response.json();
      setPendingPilots(data);
    } catch (err) {
      setError('Failed to load pending pilots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePilotAction = async (pilotId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`/api/admin/pilots/${pilotId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} pilot`);
      }

      // Reload data
      await loadDashboardData();
      await loadPendingPilots();

      alert(`Pilot ${action}d successfully`);
    } catch (err) {
      setError(`Failed to ${action} pilot`);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="panel pad">
          <p>Loading admin dashboard...</p>
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
        <h1>Admin Portal</h1>
        
        {/* Dashboard Overview */}
        {dashboardData && (
          <div className="grid" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3>Pending Pilots</h3>
              <div className="hero-title">{dashboardData.pendingPilots}</div>
            </div>
            <div className="card">
              <h3>Total Pilots</h3>
              <div className="hero-title">{dashboardData.totalPilots}</div>
            </div>
            <div className="card">
              <h3>Total Flights</h3>
              <div className="hero-title">{dashboardData.totalFlights}</div>
            </div>
            <div className="card">
              <h3>Total Bookings</h3>
              <div className="hero-title">{dashboardData.totalBookings}</div>
            </div>
          </div>
        )}

        {/* Pending Pilots */}
        <div className="section">
          <h2>Pending Pilot Approvals</h2>
          
          {pendingPilots.length === 0 ? (
            <div className="panel pad">
              <p>No pending pilot approvals.</p>
            </div>
          ) : (
            <div className="grid">
              {pendingPilots.map((pilot) => (
                <div key={pilot.pilotId} className="card">
                  <h4>{pilot.user.firstName} {pilot.user.lastName}</h4>
                  <div className="muted">Email: {pilot.user.email}</div>
                  <div className="muted">Phone: {pilot.user.phoneNumber}</div>
                  {pilot.user.homeZipCode && (
                    <div className="muted">Zip Code: {pilot.user.homeZipCode}</div>
                  )}
                  <div className="muted">
                    Applied: {new Date(pilot.user.createdAt).toLocaleDateString()}
                  </div>
                  
                  {/* Document Links */}
                  <div style={{ marginTop: 12 }}>
                    {pilot.faaLicenseUrl && (
                      <div>
                        <a href={pilot.faaLicenseUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
                          View FAA License
                        </a>
                      </div>
                    )}
                    {pilot.officialIdUrl && (
                      <div>
                        <a href={pilot.officialIdUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
                          View Official ID
                        </a>
                      </div>
                    )}
                    {pilot.insuranceProofUrl && (
                      <div>
                        <a href={pilot.insuranceProofUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
                          View Insurance Proof
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="sp" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handlePilotAction(pilot.pilotId, 'approve')}
                      className="btn btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handlePilotAction(pilot.pilotId, 'reject', reason);
                        }
                      }}
                      className="btn btn-ghost"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}