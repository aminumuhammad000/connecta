// scripts/seedJobs.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../src/models/Job.model";
import User from "../src/models/user.model";

dotenv.config();

const sampleJobs = [
  {
    title: "Senior Full Stack Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    locationType: "remote",
    jobType: "full-time",
    salary: {
      min: 120000,
      max: 180000,
      currency: "USD",
    },
    description: "We're looking for an experienced Full Stack Developer to join our dynamic team. You'll be working on cutting-edge web applications using React, Node.js, and MongoDB.",
    requirements: [
      "5+ years of experience in full stack development",
      "Strong proficiency in React and Node.js",
      "Experience with MongoDB or similar NoSQL databases",
      "Excellent problem-solving skills",
    ],
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "REST API"],
    experience: "5+ years",
    category: "Software Development",
    status: "active",
  },
  {
    title: "UI/UX Designer",
    company: "Creative Studio Inc",
    location: "New York, NY",
    locationType: "hybrid",
    jobType: "full-time",
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    description: "Join our creative team to design beautiful and intuitive user interfaces for web and mobile applications.",
    requirements: [
      "3+ years of UI/UX design experience",
      "Proficiency in Figma and Adobe Creative Suite",
      "Strong portfolio demonstrating design skills",
      "Understanding of user-centered design principles",
    ],
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Wireframing"],
    experience: "3+ years",
    category: "Design",
    status: "active",
  },
  {
    title: "Mobile App Developer (Flutter)",
    company: "AppMakers Ltd",
    location: "Austin, TX",
    locationType: "remote",
    jobType: "contract",
    salary: {
      min: 100000,
      max: 150000,
      currency: "USD",
    },
    description: "We need a skilled Flutter developer to build cross-platform mobile applications for our clients.",
    requirements: [
      "3+ years of mobile development experience",
      "Strong knowledge of Flutter and Dart",
      "Experience with Firebase",
      "Published apps on App Store and Google Play",
    ],
    skills: ["Flutter", "Dart", "Firebase", "iOS", "Android"],
    experience: "3+ years",
    category: "Mobile Development",
    status: "active",
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech Systems",
    location: "Seattle, WA",
    locationType: "remote",
    jobType: "full-time",
    salary: {
      min: 130000,
      max: 170000,
      currency: "USD",
    },
    description: "Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.",
    requirements: [
      "4+ years of DevOps experience",
      "Strong knowledge of AWS or Azure",
      "Experience with Docker and Kubernetes",
      "Proficiency in scripting (Python, Bash)",
    ],
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Python", "Terraform"],
    experience: "4+ years",
    category: "DevOps",
    status: "active",
  },
  {
    title: "Content Writer",
    company: "Digital Marketing Pro",
    location: "Remote",
    locationType: "remote",
    jobType: "freelance",
    salary: {
      min: 40000,
      max: 70000,
      currency: "USD",
    },
    description: "We're seeking a talented content writer to create engaging blog posts, articles, and marketing copy.",
    requirements: [
      "2+ years of content writing experience",
      "Excellent English writing skills",
      "SEO knowledge",
      "Ability to research and write on various topics",
    ],
    skills: ["Content Writing", "SEO", "Copywriting", "Blog Writing", "Research"],
    experience: "2+ years",
    category: "Content & Marketing",
    status: "active",
  },
  {
    title: "Data Scientist",
    company: "DataInsights Corp",
    location: "Boston, MA",
    locationType: "onsite",
    jobType: "full-time",
    salary: {
      min: 110000,
      max: 160000,
      currency: "USD",
    },
    description: "Join our data science team to analyze complex datasets and build machine learning models.",
    requirements: [
      "Master's degree in Data Science or related field",
      "3+ years of data science experience",
      "Strong Python and SQL skills",
      "Experience with machine learning frameworks",
    ],
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Analysis"],
    experience: "3+ years",
    category: "Data Science",
    status: "active",
  },
  {
    title: "Frontend Developer (React)",
    company: "WebSolutions Agency",
    location: "Los Angeles, CA",
    locationType: "remote",
    jobType: "part-time",
    salary: {
      min: 60000,
      max: 90000,
      currency: "USD",
    },
    description: "We need a React developer to work on various client projects. Flexible hours available.",
    requirements: [
      "2+ years of React development experience",
      "Strong JavaScript skills",
      "Experience with modern CSS frameworks",
      "Good communication skills",
    ],
    skills: ["React", "JavaScript", "CSS", "HTML", "Responsive Design"],
    experience: "2+ years",
    category: "Frontend Development",
    status: "active",
  },
  {
    title: "Graphic Designer",
    company: "Brand Studio",
    location: "Miami, FL",
    locationType: "hybrid",
    jobType: "full-time",
    salary: {
      min: 55000,
      max: 85000,
      currency: "USD",
    },
    description: "Create stunning visual designs for branding, marketing materials, and digital media.",
    requirements: [
      "3+ years of graphic design experience",
      "Proficiency in Adobe Creative Suite",
      "Strong portfolio",
      "Brand identity experience",
    ],
    skills: ["Adobe Illustrator", "Photoshop", "InDesign", "Branding", "Typography"],
    experience: "3+ years",
    category: "Design",
    status: "active",
  },
];

async function seedJobs() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    // Find or create a client user to assign as job poster
    let client = await User.findOne({ userType: "employer" });
    
    if (!client) {
      console.log("📝 No employer found. Creating default employer...");
      client = await User.create({
        firstName: "Tech",
        lastName: "Recruiter",
        email: "recruiter@techcorp.com",
        password: "password123", // In production, this should be hashed
        userType: "employer",
      });
      console.log("✅ Default employer created");
    }

    // Clear existing jobs
    await Job.deleteMany({});
    console.log("🗑️  Cleared existing jobs");

    // Insert sample jobs
    const jobsWithClient = sampleJobs.map((job) => ({
      ...job,
      clientId: client._id,
    }));

    await Job.insertMany(jobsWithClient);
    console.log(`✅ Successfully seeded ${sampleJobs.length} jobs`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding jobs:", error);
    process.exit(1);
  }
}

seedJobs();
