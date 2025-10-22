import Header from "../../components/Header";
import ReviewCard from "./components/ReviewCardProps";
import styles from "./styles/Profile.module.css";
import profile from "../../assets/user.png"

const Profile = () => {
  return (
    <div className={styles.profile}>
      <Header />
      <h1 className={styles.title}>My profile</h1>
      <ReviewCard
        name="John Doe"
        text="Great experience using this platform! The interface is clean and intuitive."
        rating={4}
        imageUrl={profile}
      />
    </div>
  );
};

export default Profile;
