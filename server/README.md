
### **1. Job Posting — Senior React Developer**

**Job Title:** Senior React Developer
**Budget (USD):** $3,000 - $5,000
**Company:** Acme Inc.
**Location:** Remote
**Job Type:** Full-time
**Location Type:** Remote
**Experience:** 4+ years
**Category:** Web Development
**Brief Description:**
We’re looking for an experienced React Developer to join our team and help build a high-performance web application for e-commerce analytics. The ideal candidate should have a deep understanding of React, modern JavaScript, and REST APIs.
**Required Skills:**
React.js, TypeScript, Redux, REST API, Git

---

### **2. Job Posting — UI/UX Designer**

**Job Title:** UI/UX Designer
**Budget (USD):** $2,000 - $3,500
**Company:** PixelHub Studio
**Location:** Remote
**Job Type:** Part-time
**Location Type:** Remote
**Experience:** 3+ years
**Category:** Design
**Brief Description:**
We’re seeking a creative UI/UX Designer to design beautiful and intuitive interfaces for our SaaS dashboard and mobile app. You’ll work closely with developers to bring ideas to life.
**Required Skills:**
Figma, Adobe XD, Wireframing, Prototyping, User Research

---

### **3. Job Posting — Blockchain Smart Contract Developer**

**Job Title:** Blockchain Smart Contract Developer
**Budget (USD):** $5,000 - $8,000
**Company:** BorderChain Labs
**Location:** Remote
**Job Type:** Full-time
**Location Type:** Remote
**Experience:** 2+ years
**Category:** Blockchain Development
**Brief Description:**
Looking for a Solidity developer to build and audit smart contracts for our cross-border transaction protocol on Ethereum and TON. You’ll work on token contracts, decentralized agreements, and integrations.
**Required Skills:**
Solidity, Foundry, Smart Contract Security, EVM, GitHub

---

### **4. Job Posting — Mobile App Developer (React Native)**

**Job Title:** Mobile App Developer (React Native)
**Budget (USD):** $2,500 - $4,500
**Company:** AppStation Technologies
**Location:** Lagos, Nigeria
**Job Type:** Full-time
**Location Type:** Hybrid
**Experience:** 3+ years
**Category:** Mobile Development
**Brief Description:**
We need a React Native Developer to develop and maintain cross-platform mobile applications for our global app discovery platform. You’ll ensure smooth performance across Android and iOS.
**Required Skills:**
React Native, REST APIs, Firebase, JavaScript, Expo

---

### **5. Job Posting — AI Engineer**

**Job Title:** AI Engineer
**Budget (USD):** $6,000 - $10,000
**Company:** NeuralCore Systems
**Location:** San Francisco, CA
**Job Type:** Full-time
**Location Type:** Hybrid
**Experience:** 4+ years
**Category:** Artificial Intelligence
**Brief Description:**
We’re hiring an AI Engineer to develop and deploy machine learning models for voice and text-based assistants. The role involves working with NLP frameworks and large datasets.
**Required Skills:**
Python, TensorFlow, NLP, PyTorch, Machine Learning



<!-- api end points  -->
npm run seed:job-proposals

## User Endpoints
<!-- register a new user -->
POST http://localhost:5000/api/users/signup

<!-- login user -->
http://localhost:5000/api/users/signin




<!-- profile API START HERE -->

http://localhost:5000/api/profiles

POST /api/profiles
GET /api/profiles
GET /api/profiles/:id
PUT /api/profiles/:id
<!-- DELETE /api/profiles/6720bc8f2a9a442f208b912e -->
 <!-- eg:  -->
 {
  "message": "Profile deleted successfully"
}

<!-- PUT /api/profiles/6720bc8f2a9a442f208b912e -->

<!-- eg:  -->
{
  "location": "Lagos, Nigeria",
  "phoneNumber": "+2348109999999"
}

<!-- json for testing:  -->
{
  "user": "671f4b8a9123de8e97a2c9b4",
  "phoneNumber": "+2348102345678",
  "location": "Abuja, Nigeria",
  "resume": "https://res.cloudinary.com/example/resume.pdf",
  "education": [
    {
      "institution": "Ahmadu Bello University",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018-10-01",
      "endDate": "2022-07-15"
    }
  ],
  "languages": [
    {
      "language": "English",
      "proficiency": "fluent"
    },
    {
      "language": "Hausa",
      "proficiency": "native"
    }
  ],
  "employment": [
    {
      "company": "Swallern Technologies",
      "position": "Frontend Developer",
      "startDate": "2023-01-10",
      "description": "Worked on user interfaces and dashboard optimization using React and TypeScript."
    },
    {
      "company": "Freelance",
      "position": "Fullstack Developer",
      "startDate": "2024-03-01",
      "description": "Built web apps for clients using MERN stack and integrated AI APIs."
    }
  ]
}

<!-- profile API END HERE --># connecta-server
