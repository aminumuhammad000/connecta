import styles from "../../../styles/layouts/HowItWorks.module.css"
import image1 from "../../../assets/hero.png"
import { Icon } from "@iconify/react"

const cards = [
    {
        title: "Create Your Profile",
        icon: "iconamoon:profile-fill",
        image: image1,
        description: "Sign up, add your skills, portfolio, and availability all for free.",
        button: "Create profile"
    },
        {
        title: "Get Matched Instantly",
        icon: "iconamoon:profile-fill",
        image: image1,
        description: "AI scouts jobs across platforms and alerts you with the best gigs.",
        button: "Browse jobs"
    },
        {
        title: "Create Your Profile",
        icon: "iconamoon:profile-fill",
        image: image1,
        description: "Sign up, add your skills, portfolio, and availability all for free.",
        button: "Browse jobs"
    }
]
const HowItWorks = () => {
  return (
    <div className={styles.HowItWorks}>
        <h2 className={styles.mainTitle}>How it works</h2>

        <div className={styles.cardContainer}>
            {cards.map((card, index) => <div className={styles.card} key={index}> 
                        <img src={card.image} alt={card.title} className={styles.image}/>
                        <h3 className={styles.title}>{card.title} <span><Icon icon={card.icon} className={styles.icon}/></span></h3>
                        <p className={styles.description}>{card.description}</p>
                        <button className={styles.btn}>{card.button}</button>
            </div>)}
        </div>
    </div>
  )
}

export default HowItWorks
