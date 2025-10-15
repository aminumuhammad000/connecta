import styles from "../../../styles/layouts/Features.module.css"
import { Icon } from "@iconify/react"

const features = [
    {
        icon: "hugeicons:ai-user",
        title: "AI Gig Scouting",
        description: "Connecta crawls job boards and brings gigs into one place."

    },
        {
        icon: "mingcute:search-ai-fill",
        title: "Smart Matching",
        description: "AI recommends the best jobs or freelancers based on skills, budget, and ratings"

    },
        {
        icon: "streamline-plump:mail-notification-remix",
        title: "Gig Alerts",
        description: "Get instant notifications via WhatsApp, email, or in-app alerts."

    },
        {
        icon: "iconamoon:profile-fill",
        title: "Freelancer Profiles",
        description: "Showcase your portfolio, skills, and ratings, all in one profile."

    },
        {
        icon: "material-symbols:star-rate-rounded",
        title: "Ratings & Reputation",
        description: "Build trust with ratings and reviews after every completed gig."

    },
        {
        icon: "mdi:graph-line",
        title: "AI Profile Optimizer",
        description: "Get smart tips to improve your profile and land more gigs."

    }
]
const Features = () => {
  return (
    <div className={styles.Features}>
      <h2 className={styles.mainTitle}>Features</h2>
      <p className={styles.subTitle}>Powerful Features to Grow Your Freelance Journey</p>
      <p className={styles.mainDescription}>From AI gig scouting to secure payments, Connecta makes freelancing simple and rewarding.</p>

      <div className={styles.cardCOntainer}>
            {features.map((feature, index) => <div className={styles.featureCard} key={index}>
                    <span><Icon icon={feature.icon} className={styles.icon}/></span>
                    <h3 className={styles.title}>{feature.title}</h3>
                    <p className={styles.description}>{feature.description}</p>
                 </div>)}
      </div>
      <button className={styles.cta}>Get started for free</button>
    </div>
  )
}

export default Features
