import styles from "../../../styles/layouts/Pricing.module.css"
import { Icon } from '@iconify/react';

const prices = [
  {
    title: "Freelancers Premium",
    price: "₦2,500 / month",
    description: "Free gets you started. Premium takes you further",
    features: [
      "Instant gig alerts (real-time WhatsApp/email notifications).",
      "Higher profile visibility in search results.",
      "AI portfolio enhancement & optimization.",
    ],
    button: "Upgrade as Freelancer",
  },
  {
    title: "Clients Premium",
    price: "₦2,500 / month",
    description: "Free gets you started. Premium takes you further",
    features: [
      "Access to top freelancers instantly.",
      "Priority in AI matches.",
      "Premium support with faster response times.",
    ],
    button: "Upgrade as Client",
  },
]

const Pricing = () => {
  return (
    <div className={styles.Pricing}>
      <h2 className={styles.mainTitle}>Pricing</h2>
      <p className={styles.subTitle}>Choose Your Premium Plan</p>
      <p className={styles.description}>
        Upgrade to unlock more opportunities, faster matches, and premium support.
      </p>

      <div className={styles.priceContainer}>
        {prices.map((price, index) => (
          <div key={index} className={styles.card}>
            <p className={styles.title}>{price.title}</p>
            <h1 className={styles.price}>{price.price}</h1>
            <p className={styles.description}>{price.description}</p>
            <ul className={styles.navList}>
              {price.features.map((feature, idx) => (
                <li key={idx}><Icon icon="fluent-mdl2:check-mark" />{feature}</li>
              ))}
            </ul>
            <button className={styles.button}>{price.button}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Pricing
