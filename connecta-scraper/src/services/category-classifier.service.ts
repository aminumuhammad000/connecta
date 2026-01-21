import { ExternalGig } from "../types";
import { logger } from "../utils/logger";

/**
 * Category Classifier Service
 * Automatically categorizes jobs based on title, description, and skills
 */
export class CategoryClassifierService {
    // Category keywords mapping - based on Connecta's categories
    private categoryKeywords = {
        "Technology & Programming": {
            keywords: [
                "developer", "engineer", "programmer", "software", "web", "mobile", "app",
                "frontend", "backend", "fullstack", "full-stack", "devops", "cloud",
                "javascript", "python", "java", "react", "node", "angular", "vue",
                "database", "sql", "mongodb", "api", "coding", "saas", "tech",
                "cybersecurity", "blockchain", "web3", "game development", "qa", "testing",
                "data science", "machine learning", "ai", "artificial intelligence"
            ],
            niches: {
                "Web Development": ["web developer", "frontend", "backend", "fullstack", "html", "css", "javascript"],
                "Mobile Development": ["mobile", "ios", "android", "react native", "flutter", "swift", "kotlin"],
                "Software Engineering": ["software engineer", "programmer", "coding", "development"],
                "Data Science": ["data scientist", "machine learning", "ai", "analytics", "big data"],
                "DevOps & Cloud": ["devops", "cloud", "aws", "azure", "docker", "kubernetes"],
                "Cybersecurity": ["security", "cybersecurity", "penetration testing", "ethical hacking"],
                "Blockchain & Web3": ["blockchain", "web3", "crypto", "smart contract", "solidity"],
            }
        },
        "Design & Creative": {
            keywords: [
                "designer", "design", "ui", "ux", "graphic", "creative", "photoshop",
                "illustrator", "figma", "sketch", "branding", "logo", "visual",
                "3d", "animation", "video", "illustration", "art", "creative director",
                "product design", "fashion design", "interior design"
            ],
            niches: {
                "Graphic Design": ["graphic design", "photoshop", "illustrator"],
                "UI/UX Design": ["ui", "ux", "user interface", "user experience", "figma", "sketch"],
                "Logo & Branding": ["logo", "branding", "brand identity"],
                "3D Modeling & Rendering": ["3d", "modeling", "rendering", "blender"],
                "Video Production": ["video", "videographer", "video production"],
                "Animation": ["animation", "animator", "motion graphics"],
            }
        },
        "Marketing & Sales": {
            keywords: [
                "marketing", "sales", "seo", "sem", "social media", "digital marketing",
                "content marketing", "email marketing", "advertising", "ppc", "analytics",
                "copywriting", "market research", "brand", "campaign", "lead generation",
                "business development", "affiliate", "public relations", "pr"
            ],
            niches: {
                "Digital Marketing": ["digital marketing", "online marketing"],
                "Social Media Marketing": ["social media", "instagram", "facebook", "twitter", "linkedin"],
                "SEO & SEM": ["seo", "sem", "search engine", "google ads"],
                "Content Marketing": ["content marketing", "content strategy"],
                "Sales & Business Dev": ["sales", "business development", "lead generation"],
            }
        },
        "Business & Finance": {
            keywords: [
                "accountant", "finance", "accounting", "bookkeeping", "financial",
                "business analyst", "consultant", "project manager", "admin",
                "virtual assistant", "data entry", "legal", "lawyer", "attorney",
                "hr", "human resources", "recruiting", "recruitment", "supply chain"
            ],
            niches: {
                "Accounting & Bookkeeping": ["accounting", "bookkeeping", "accountant"],
                "Financial Analysis": ["financial analyst", "finance"],
                "Project Management": ["project manager", "scrum master", "agile"],
                "Virtual Assistant": ["virtual assistant", "va", "admin assistant"],
                "Legal Consulting": ["legal", "lawyer", "attorney"],
                "HR & Recruiting": ["hr", "human resources", "recruiter", "recruitment"],
            }
        },
        "Writing & Translation": {
            keywords: [
                "writer", "writing", "content writer", "copywriter", "editor",
                "translator", "translation", "proofreading", "technical writer",
                "blogger", "journalist", "author", "creative writing", "grant writing"
            ],
            niches: {
                "Copywriting": ["copywriter", "copywriting"],
                "Content Writing": ["content writer", "content writing", "blogger"],
                "Technical Writing": ["technical writer", "documentation"],
                "Translation": ["translator", "translation"],
                "Editing & Proofreading": ["editor", "proofreading", "editing"],
            }
        },
        "Hospitality & Events": {
            keywords: [
                "hotel", "hospitality", "event", "catering", "restaurant", "chef",
                "cook", "waiter", "bartender", "tour guide", "travel", "tourism",
                "event planner", "event coordinator"
            ],
            niches: {
                "Hotel Management": ["hotel", "hotel management"],
                "Event Planning": ["event planning", "event coordinator"],
                "Catering": ["catering", "chef", "cook"],
                "Travel Planning": ["travel", "tourism", "tour guide"],
            }
        },
        "Health & Fitness": {
            keywords: [
                "health", "fitness", "trainer", "coach", "nutrition", "wellness",
                "yoga", "personal trainer", "gym", "medical", "nurse", "doctor",
                "healthcare", "physiotherapy", "telehealth"
            ],
            niches: {
                "Personal Training": ["personal trainer", "fitness trainer"],
                "Nutrition Consulting": ["nutrition", "nutritionist", "dietitian"],
                "Wellness Coaching": ["wellness", "health coach"],
                "Yoga Instruction": ["yoga", "yoga instructor"],
                "Telehealth": ["telehealth", "telemedicine"],
            }
        },
        "Education & Training": {
            keywords: [
                "teacher", "tutor", "instructor", "education", "training",
                "course", "curriculum", "e-learning", "online teaching",
                "lecturer", "professor", "academic"
            ],
            niches: {
                "Tutoring": ["tutor", "tutoring"],
                "Online Course Creation": ["course creation", "e-learning"],
                "Language Instruction": ["language teacher", "language instructor"],
                "Educational Consulting": ["educational consultant"],
            }
        },
    };

    /**
     * Classify a job into a category and niche
     */
    classify(gig: ExternalGig): { category: string; niche?: string } {
        const searchText = `${gig.title} ${gig.description} ${gig.skills?.join(" ") || ""}`.toLowerCase();

        let bestCategory = "Other";
        let bestNiche: string | undefined;
        let maxScore = 0;

        // Score each category based on keyword matches
        for (const [category, config] of Object.entries(this.categoryKeywords)) {
            let categoryScore = 0;

            // Count keyword matches
            for (const keyword of config.keywords) {
                if (searchText.includes(keyword.toLowerCase())) {
                    categoryScore += 1;
                }
            }

            // If this category has a better score, use it
            if (categoryScore > maxScore) {
                maxScore = categoryScore;
                bestCategory = category;

                // Try to find the best niche within this category
                if (config.niches) {
                    let maxNicheScore = 0;
                    for (const [niche, nicheKeywords] of Object.entries(config.niches)) {
                        let nicheScore = 0;
                        for (const keyword of nicheKeywords) {
                            if (searchText.includes(keyword.toLowerCase())) {
                                nicheScore += 1;
                            }
                        }
                        if (nicheScore > maxNicheScore) {
                            maxNicheScore = nicheScore;
                            bestNiche = niche;
                        }
                    }
                }
            }
        }

        // Log the classification result
        if (maxScore > 0) {
            logger.debug(`📂 Classified "${gig.title}" as ${bestCategory}${bestNiche ? ` > ${bestNiche}` : ""} (score: ${maxScore})`);
        } else {
            logger.debug(`📂 No clear category for "${gig.title}", defaulting to "Other"`);
        }

        return { category: bestCategory, niche: bestNiche };
    }

    /**
     * Batch classify multiple jobs
     */
    classifyBatch(gigs: ExternalGig[]): Array<ExternalGig & { category: string; niche?: string }> {
        return gigs.map(gig => {
            const { category, niche } = this.classify(gig);
            return {
                ...gig,
                category,
                niche,
            };
        });
    }
}
