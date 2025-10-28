<!-- api end points  -->

## User Endpoints
<!-- register a new user -->
POST http://localhost:5000/api/users/signup

<!-- login user -->
POST http://localhost:5000/api/users/signin

## Job Endpoints
<!-- Get all jobs with filters -->
GET http://localhost:5000/api/jobs?category=Software%20Development&limit=10&page=1

<!-- Get recommended jobs (Jobs You May Like) -->
GET http://localhost:5000/api/jobs/recommended?limit=6

<!-- Search jobs -->
GET http://localhost:5000/api/jobs/search?q=react&limit=10

<!-- Get job by ID -->
GET http://localhost:5000/api/jobs/:id

<!-- Create new job -->
POST http://localhost:5000/api/jobs

<!-- Update job -->
PUT http://localhost:5000/api/jobs/:id

<!-- Delete job -->
DELETE http://localhost:5000/api/jobs/:id

## Proposal Endpoints
<!-- Get all proposals (admin) -->
GET http://localhost:5000/api/proposals?page=1&limit=20&type=recommendation&status=pending

<!-- Get proposals for a specific freelancer -->
GET http://localhost:5000/api/proposals/freelancer/:freelancerId?type=recommendation

<!-- Get proposal statistics for a freelancer -->
GET http://localhost:5000/api/proposals/stats/:freelancerId

<!-- Get single proposal by ID -->
GET http://localhost:5000/api/proposals/:id

<!-- Create new proposal -->
POST http://localhost:5000/api/proposals

<!-- Update proposal status (accept/decline) -->
PATCH http://localhost:5000/api/proposals/:id/status
Body: { "status": "accepted" | "declined" | "pending" | "expired" }

<!-- Update proposal -->
PUT http://localhost:5000/api/proposals/:id

<!-- Delete proposal -->
DELETE http://localhost:5000/api/proposals/:id
