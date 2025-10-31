<!-- api end points  -->

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

<!-- profile API END HERE -->