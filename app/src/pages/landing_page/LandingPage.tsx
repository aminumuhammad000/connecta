import Nav from "./layout/Nav"
import styles from "../../styles/pages/LandingPage.module.css"
import Hero from "./layout/Hero"
import HowItWorks from "./layout/HowItWorks"
import Features from "./layout/Features"
import AiSearch from "./layout/AiSearch"
import Pricing from "./layout/Pricing"

const LandingPage = () => {
  return (
    <div className={styles.LandingPage}>
        <Nav />
        <Hero />
        <HowItWorks />
        <Features />
        <AiSearch />
        <Pricing />
    </div>
  )
}

export default LandingPage
