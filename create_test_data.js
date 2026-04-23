
async function createTestData() {
  const baseUrl = 'http://localhost:5000';
  const email = `testclient${Math.floor(Math.random() * 10000)}@example.com`;
  const password = 'Password123!';

  console.log(`Creating client user: ${email} at ${baseUrl}`);

  // 1. Signup
  const signupRes = await fetch(`${baseUrl}/api/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'Test',
      lastName: 'Client',
      userType: 'client',
      phoneNumber: `080${Math.floor(Math.random() * 100000000)}`.padEnd(11, '0'),
      preferredLanguage: 'en',
      otp: '0000'
    })
  });

  const signupData = await signupRes.json();
  if (!signupRes.ok) {
    console.error('Signup failed:', signupData);
    return;
  }

  const authData = signupData.data || signupData;
  const token = authData.token;
  
  if (!token) {
    console.error('No token in response:', signupData);
    return;
  }
  
  console.log('Client created and logged in. Token obtained.');

  // 2. Create Profile
  await fetch(`${baseUrl}/api/profiles/me`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      bio: 'I am a test client looking for amazing freelancers.',
      location: 'Lagos, Nigeria',
      jobTitle: 'Product Manager'
    })
  });

  // 3. Post 5 Jobs
  const jobs = [
    { title: 'Mobile App Developer needed', description: 'Looking for an Expo expert to build a fintech app.', category: 'Software Development', budget: 50000, duration: 14, budgetType: 'fixed' },
    { title: 'Graphic Designer for Branding', description: 'Need a professional logo and brand identity.', category: 'Design', budget: 20000, duration: 7, budgetType: 'fixed' },
    { title: 'Content Writer for Blog', description: 'Write 10 articles about freelancing in Africa.', category: 'Writing', budget: 15000, duration: 30, budgetType: 'fixed' },
    { title: 'UI/UX Designer for Dashboard', description: 'Design a clean and modern dashboard for a SaaS product.', category: 'Design', budget: 45000, duration: 21, budgetType: 'fixed' },
    { title: 'Backend Engineer (Node.js)', description: 'Build REST APIs for a school management system.', category: 'Software Development', budget: 60000, duration: 30, budgetType: 'fixed' }
  ];

  for (const job of jobs) {
    const jobRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(job)
    });

    if (jobRes.ok) {
      console.log(`Posted job: ${job.title}`);
    } else {
      console.error(`Failed to post job: ${job.title}`, await jobRes.json());
    }
  }

  console.log('\n--- Test Information ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('------------------------');
}

createTestData();
