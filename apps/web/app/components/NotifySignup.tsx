"use client";

import { useEffect, useMemo, useState } from 'react';

interface SignupData {
	name: string;
	email: string;
	phone: string;
	birthday: string;
	weight: number;
	zipCode: string;
	selectionType?: 'pilot' | 'festival';
	selectionId?: string;
}

interface NotifySignupProps {
	initialSelectionType?: 'pilot' | 'festival';
	initialSelectionId?: string;
}

interface OptionItem {
	id: string;
	name: string;
}

export default function NotifySignup({ initialSelectionType, initialSelectionId }: NotifySignupProps) {
	const [formData, setFormData] = useState<SignupData>({
		name: '',
		email: '',
		phone: '',
		birthday: '',
		weight: 0,
		zipCode: '',
		selectionType: initialSelectionType,
		selectionId: initialSelectionId
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Demo lists; replace with API fetch when available
	const pilotOptions: OptionItem[] = useMemo(
		() => [
			{ id: 'pilot_alex', name: 'Captain Alex Rivera' },
			{ id: 'pilot_maria', name: 'Captain Maria Garcia' },
			{ id: 'pilot_james', name: 'Captain James Wilson' }
		],
		[]
	);
	const festivalOptions: OptionItem[] = useMemo(
		() => [
			{ id: 'fest_albuquerque', name: 'Albuquerque International Balloon Fiesta' },
			{ id: 'fest_reno', name: 'Great Reno Balloon Race' },
			{ id: 'fest_colorado', name: 'Colorado Balloon Classic' }
		],
		[]
	);

	// If no props were passed, attempt to read from URL (client side only)
	useEffect(() => {
		if (!initialSelectionType && typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const pilot = params.get('pilot');
			const festival = params.get('festival');
			if (pilot) {
				setFormData(prev => ({ ...prev, selectionType: 'pilot', selectionId: pilot }));
			} else if (festival) {
				setFormData(prev => ({ ...prev, selectionType: 'festival', selectionId: festival }));
			}
		}
	}, [initialSelectionType]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/notifications/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error('Failed to subscribe');
			}

			setSuccess(true);
			setFormData({
				name: '',
				email: '',
				phone: '',
				birthday: '',
				weight: 0,
				zipCode: ''
			});
		} catch (err) {
			setError('Failed to subscribe. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof SignupData, value: any) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	if (success) {
		const selectedName = formData.selectionType === 'pilot'
			? pilotOptions.find(p => p.id === formData.selectionId)?.name
			: festivalOptions.find(f => f.id === formData.selectionId)?.name;
		return (
			<div className="panel pad" style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
				<h3 style={{ color: '#0c4a6e', margin: '0 0 8px 0' }}>🎉 Successfully Subscribed!</h3>
				<p style={{ color: '#0369a1', margin: 0 }}>
					You&apos;ll be notified about hot air balloon flights{selectedName ? ` for ${selectedName}` : ''}. Check your email for confirmation!
				</p>
			</div>
		);
	}

	return (
		<div className="panel pad">
			<h2 style={{ background: 'linear-gradient(135deg, #ff4757, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>🎈 Get Notified About Hot Air Balloon Flights</h2>
			<p className="muted">
				Scan a QR on a pilot&apos;s balloon or festival banner to prefill, or choose a pilot/festival below to get alerts.
			</p>
			
			<form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
				<div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
					<div>
						<label className="form-label">Notify me about *</label>
						<div style={{ display: 'flex', gap: 12 }}>
							<label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
								<input
									type="radio"
									name="selectionType"
									checked={formData.selectionType === 'pilot'}
									onChange={() => handleInputChange('selectionType', 'pilot')}
								/>
								<span>Pilot</span>
							</label>
							<label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
								<input
									type="radio"
									name="selectionType"
									checked={formData.selectionType === 'festival'}
									onChange={() => handleInputChange('selectionType', 'festival')}
								/>
								<span>Festival</span>
							</label>
						</div>
					</div>

					{formData.selectionType === 'pilot' && (
						<div>
							<label htmlFor="pilotId" className="form-label">Choose Pilot *</label>
							<select
								id="pilotId"
								className="form-input"
								value={formData.selectionId || ''}
								onChange={(e) => handleInputChange('selectionId', e.target.value)}
								required
							>
								<option value="" disabled>Select a pilot</option>
								{pilotOptions.map(p => (
									<option key={p.id} value={p.id}>{p.name}</option>
								))}
							</select>
						</div>
					)}

					{formData.selectionType === 'festival' && (
						<div>
							<label htmlFor="festivalId" className="form-label">Choose Festival *</label>
							<select
								id="festivalId"
								className="form-input"
								value={formData.selectionId || ''}
								onChange={(e) => handleInputChange('selectionId', e.target.value)}
								required
							>
								<option value="" disabled>Select a festival</option>
								{festivalOptions.map(f => (
									<option key={f.id} value={f.id}>{f.name}</option>
								))}
							</select>
						</div>
					)}

					<div>
						<label htmlFor="name" className="form-label">
							Full Name *
						</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							onChange={(e) => handleInputChange('name', e.target.value)}
							className="form-input"
							required
							placeholder="Enter your full name"
						/>
					</div>

					<div>
						<label htmlFor="email" className="form-label">
							Email Address *
						</label>
						<input
							type="email"
							id="email"
							value={formData.email}
							onChange={(e) => handleInputChange('email', e.target.value)}
							className="form-input"
							required
							placeholder="your.email@example.com"
						/>
					</div>

					<div>
						<label htmlFor="phone" className="form-label">
							Phone Number *
						</label>
						<input
							type="tel"
							id="phone"
							value={formData.phone}
							onChange={(e) => handleInputChange('phone', e.target.value)}
							className="form-input"
							required
							placeholder="(555) 123-4567"
						/>
					</div>

					<div>
						<label htmlFor="birthday" className="form-label">
							Birthday *
						</label>
						<input
							type="date"
							id="birthday"
							value={formData.birthday}
							onChange={(e) => handleInputChange('birthday', e.target.value)}
							className="form-input"
							required
						/>
					</div>

					<div>
						<label htmlFor="weight" className="form-label">
							Weight (lbs) * ⚠️
						</label>
						<input
							type="number"
							id="weight"
							value={formData.weight || ''}
							onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
							className="form-input"
							required
							min="50"
							max="300"
							placeholder="150"
						/>
						<div style={{ fontSize: '0.8em', color: '#dc2626', marginTop: 4 }}>
							⚠️ Weight is required for safety - balloons have weight limits to prevent overloading
						</div>
					</div>

					<div>
						<label htmlFor="zipCode" className="form-label">
							ZIP Code
						</label>
						<input
							type="text"
							id="zipCode"
							value={formData.zipCode}
							onChange={(e) => handleInputChange('zipCode', e.target.value)}
							className="form-input"
							placeholder="12345"
						/>
					</div>
				</div>

				{error && (
					<div style={{ backgroundColor: '#fee', border: '1px solid #fcc', padding: 12, borderRadius: 4, marginTop: 16 }}>
						<p style={{ color: '#c33', margin: 0 }}>Error: {error}</p>
					</div>
				)}

				<div style={{ marginTop: 16 }}>
					<button
						type="submit"
						disabled={
							loading
							|| !formData.name
							|| !formData.email
							|| !formData.phone
							|| !formData.birthday
							|| !formData.weight
							|| !formData.selectionType
							|| !formData.selectionId
						}
						className="btn btn-primary"
						style={{ width: '100%' }}
					>
						{loading ? 'Subscribing...' : 'Subscribe to Notifications'}
					</button>
				</div>

				<p style={{ fontSize: '0.8em', color: '#666', marginTop: 12, textAlign: 'center' }}>
					We&apos;ll only use your information to send flight notifications. No spam, ever!
				</p>
			</form>
		</div>
	);
}


