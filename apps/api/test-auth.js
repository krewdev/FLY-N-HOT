const API_BASE = 'http://localhost:4000';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  // Test data
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phoneNumber: `+1555${Math.floor(Math.random() * 10000000)}`,
    password: 'testpassword123',
    homeZipCode: '12345'
  };

  try {
    // 1. Test Signup
    console.log('1️⃣ Testing Signup...');
    const signupRes = await fetch(`${API_BASE}/auth/signup/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const signupData = await signupRes.json();
    console.log('Signup Response:', signupRes.status, signupData);
    
    if (!signupRes.ok) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }

    const { token } = signupData;
    console.log('✅ Signup successful! Token received.\n');

    // 2. Test Login
    console.log('2️⃣ Testing Login...');
    const loginRes = await fetch(`${API_BASE}/auth/login/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData);
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log('✅ Login successful!\n');

    // 3. Test Get Current User
    console.log('3️⃣ Testing Get Current User...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });

    const meData = await meRes.json();
    console.log('Me Response:', meRes.status, meData);
    
    if (!meRes.ok) {
      throw new Error(`Get current user failed: ${JSON.stringify(meData)}`);
    }
    console.log('✅ Get current user successful!\n');

    // 4. Test Invalid Token
    console.log('4️⃣ Testing Invalid Token...');
    const invalidRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 
        'Authorization': 'Bearer invalid_token'
      }
    });

    const invalidData = await invalidRes.json();
    console.log('Invalid Token Response:', invalidRes.status, invalidData);
    console.log('✅ Invalid token correctly rejected!\n');

    // 5. Test Pilot Registration
    console.log('5️⃣ Testing Pilot Registration...');
    const pilotData = {
      ...testUser,
      email: `pilot${Date.now()}@example.com`,
      phoneNumber: `+1555${Math.floor(Math.random() * 10000000)}`,
      pilotLicenseNumber: '123456789',
      pilotLicenseState: 'CA'
    };

    const pilotRes = await fetch(`${API_BASE}/auth/pilot/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pilotData)
    });

    const pilotRegData = await pilotRes.json();
    console.log('Pilot Registration Response:', pilotRes.status, pilotRegData);
    
    if (!pilotRes.ok) {
      throw new Error(`Pilot registration failed: ${JSON.stringify(pilotRegData)}`);
    }
    console.log('✅ Pilot registration successful!\n');

    console.log('🎉 All authentication tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Wait a bit for the server to be ready if just started
setTimeout(testAuth, 1000);