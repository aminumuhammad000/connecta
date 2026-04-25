import Nav from "./layout/Nav"
import styles from "../../styles/pages/LandingPage.module.css"
import Hero from "./layout/Hero"
import SampleJobs from "./layout/SampleJobs"
import TopCompanies from "./layout/TopCompanies"
import CollaboOverview from "./layout/CollaboOverview"
import ConnectaAI from "./layout/ConnectaAI"
import TopFreelancers from "./layout/TopFreelancers"
import HowItWorks from "./layout/HowItWorks"
import Features from "./layout/Features"
import AiSearch from "./layout/AiSearch"
import MobileApp from "./layout/MobileApp"
import CallToAction from "./layout/CallToAction"
import FeedBack from "./layout/FeedBack"
import Footer from "./layout/Footer"
import FAQ from "./layout/FAQ"

const LandingPage = () => {
  return (
    <div className={styles.LandingPage}>
      <Nav />
      <Hero />
      <SampleJobs />
      <TopCompanies />
      <CollaboOverview />
      <ConnectaAI />
      <TopFreelancers />
      <HowItWorks />
      <Features />
      <AiSearch />
      <MobileApp />
      <FAQ />
      <CallToAction />
      {/* <AboutUs /> */}
      <FeedBack />
      <Footer />
    </div>
  )
}

export default LandingPage

