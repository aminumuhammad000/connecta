import hero from "../../../assets/hero.png"
import styles from "../../../styles/layouts/Hero.module.css"
import { Icon } from "@iconify/react"

const Hero = () => {
  return (
    <div className={styles.Hero}>
        <img src={hero} alt="hero section image" className={styles.image}/>

        <div className={styles.mainContainer}>
        <div className={styles.titleContainer}>
        <h2 className={styles.title}>Where Talent Meets Opportunity One Profile, Endless Gigs.</h2>
        <p className={styles.description}>AI finds the right jobs for you, or the right talent for your project.</p>
    </div>
    <div className={styles.container}>
        <ul className={styles.nav}>
            <li className={styles.active}>Find freelancer</li>
            <li>Browse jobs</li>
        </ul>

        <div className={styles.searchContainer}>
            <input type="search" placeholder="What skill do you need today? AI matches instantly..."/>
            <button className={styles.btnSearch}>
                <Icon icon="mingcute:search-line" />
            </button>
        </div>
    </div>
    </div>

    </div>
  )
}

export default Hero
