import Nav from "./layout/Nav"
import styles from "../../styles/pages/LandingPage.module.css"
import Hero from "./layout/Hero"

const LandingPage = () => {
  return (
    <div className={styles.LandingPage}>
        <Nav />
        <Hero />
    </div>
  )
}

export default LandingPage
