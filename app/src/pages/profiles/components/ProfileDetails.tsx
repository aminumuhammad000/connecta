import { Icon } from "@iconify/react";
import styles from "../styles/ProfileDetails.module.css";
const ProfileDetails = () => {
  return (
    <div>
      <p className={styles.ProfileDetails}>Skills / Tolls</p>
      <h2 className={styles.Skills}>
        UI/UX Design, Product Design, Video Editing Figma, A. Premiere pro
      </h2>
      <h2 className={styles.price}>₦ 10,000/hr</h2>

      <div><span>Professional Summary</span> <button><Icon icon="ic:outline-edit"></Icon></button></div>
      <p className={styles.bio}>
        A skilled problem solver and professional UI/UX designer with over 4
        years of experience in creating intuitive and aesthetically pleasing
        digital interface. Also... <span>more</span>
      </p>
    </div>
  );
};

export default ProfileDetails;
