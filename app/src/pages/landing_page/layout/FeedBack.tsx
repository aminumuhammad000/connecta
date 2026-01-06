import styles from "../../../styles/layouts/FeedBack.module.css"
import sarahProfile from "../../../assets/sarah_johnson.png"
import michaelProfile from "../../../assets/michael_chen.png"
import davidProfile from "../../../assets/david_williams.png"
import { Icon } from "@iconify/react"

const feedbacks = [
  {
    title: "E-Commerce Platform Development",
    icon: "ic:twotone-shopping-cart",
    description:
      "\"Working with this freelancer was exceptional! They delivered a fully responsive e-commerce platform with seamless payment integration and an intuitive admin dashboard. The project was completed ahead of schedule and exceeded all our expectations. Highly professional and skilled developer!\"",
    rating: 5,
    name: "Sarah Johnson",
    date: "Jan 15, 2026",
    profile: sarahProfile,
    project: "ShopNow E-Commerce Platform"
  },
  {
    title: "Mobile App UI/UX Design",
    icon: "ic:twotone-color-lens",
    description:
      "\"Outstanding design work! The freelancer created a beautiful, modern interface for our fitness app with smooth animations and excellent user flow. Their attention to detail and responsiveness to feedback made the collaboration effortless. Definitely recommending for future projects!\"",
    rating: 5,
    name: "Michael Chen",
    date: "Dec 10, 2025",
    profile: michaelProfile,
    project: "FitTrack Mobile App Design"
  },
  {
    title: "Brand Identity & Logo Design",
    icon: "ic:twotone-brush",
    description:
      "\"Amazing creativity and professionalism! The designer captured our vision perfectly and delivered multiple logo concepts with complete brand guidelines. Communication was excellent throughout the process, and revisions were handled promptly. Our new brand identity looks incredible!\"",
    rating: 5,
    name: "David Williams",
    date: "Nov 22, 2025",
    profile: davidProfile,
    project: "TechStart Brand Identity"
  },
]

const FeedBack = () => {
  return (
    <div className={styles.FeedBack}>
      <h1 className={styles.mainTitle}>Feedback from clients</h1>
      <div className={styles.feedbackContainer}>
        {feedbacks.map((feedback, index) => (
          <div key={index} className={styles.feedbackCard}>
            <h2>
              <Icon icon={feedback.icon} className={styles.icon} />
              {feedback.title}
            </h2>

            <p className={styles.description}>{feedback.description}</p>

            {/* ⭐ RATING STARS */}
            <div className={styles.rating}>
              {[...Array(feedback.rating)].map((_, i) => (
                <Icon
                  key={i}
                  icon="mdi:star"
                  className={styles.star}
                />
              ))}
            </div>

            <p className={styles.small}>Work done by {feedback.name}</p>
            <p className={styles.small}>{feedback.project}</p>
            <p className={styles.small}>{feedback.date}</p>
            <img
              src={feedback.profile}
              alt={feedback.name}
              className={styles.profile}
            />
          </div>
        ))}
      </div>

      {/* Enhanced CTA Section */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaIcon}>
            <Icon icon="mdi:rocket-launch" />
          </div>
          <h2 className={styles.ctaTitle}>
            Ready to Transform Your Business?
          </h2>
          <p className={styles.ctaDescription}>
            Connect with world-class freelancers and turn your vision into reality. Whether you need a quick fix or a long-term partner, we've got the perfect match for you.
          </p>
          <div className={styles.ctaStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Active Freelancers</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Success Rate</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Support Available</span>
            </div>
          </div>
          <div className={styles.ctaButtons}>
            <a href="https://app.myconnecta.ng" className={styles.primaryBtn}>
              <Icon icon="mdi:account-search" className={styles.btnIcon} />
              Find Freelancers
            </a>
            <a href="https://app.myconnecta.ng" className={styles.secondaryBtn}>
              <Icon icon="mdi:briefcase-upload" className={styles.btnIcon} />
              Post a Project
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedBack
