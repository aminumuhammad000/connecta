import styles from "../../../styles/layouts/FeedBack.module.css"
import user from "../../../assets/user.png"
import { Icon } from "@iconify/react"

const feedbacks = [
  {
    title: "UI/UX Design",
    icon: "ic:twotone-color-lens",
    description:
      "“Lorem ipsum dolor sit amet consectetur. Proin sollicitudin lorem egestas auctor. Faucibus etiam facilisis ultricies pellentesque vestibulum at. Nunc morbi pretium sed vulputate lacus. Malesuada diam erat tincidunt tristique ac donec tempus nunc faucibus”",
    rating: 5,
    name: "Aminu Muhammad",
    date: "Mar 28, 2025",
    profile: user,
  },
  {
    title: "Web Development",
    icon: "ic:twotone-color-lens",
    description:
      "“Lorem ipsum dolor sit amet consectetur. Proin sollicitudin lorem egestas auctor. Faucibus etiam facilisis ultricies pellentesque vestibulum at. Nunc morbi pretium sed vulputate lacus. Malesuada diam erat tincidunt tristique ac donec tempus nunc faucibus”",
    rating: 4,
    name: "Aminu Muhammad",
    date: "Mar 28, 2025",
    profile: user,
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
            <p className={styles.small}>MEDBUDDY AI Platform design</p>
            <p className={styles.small}>{feedback.date}</p>
            <img
              src={feedback.profile}
              alt={feedback.name}
              className={styles.profile}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeedBack
