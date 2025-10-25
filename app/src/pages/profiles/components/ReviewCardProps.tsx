import React from "react";
import { Icon } from "@iconify/react";
import styles from "../styles/ReviewCardProps.module.css";

interface ReviewCardProps {
  name: string;
  text: string;
  rating: number; // e.g. 4
  imageUrl: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ name, rating, imageUrl }) => {
  const stars = Array.from({ length: 5 }, (_, i) =>
    i + 1 <= rating ? (
      <Icon key={i} icon="mdi:star" className={styles.star} />
    ) : (
      <Icon key={i} icon="mdi:star-outline" className={styles.star} />
    )
  );

  return (
    <div className={styles.card}>
      <div className={styles.profile}>
        <div className={styles.avatarWrapper}>
          <img src={imageUrl} alt={name} className={styles.avatar} />
          <div className={styles.editIcon}>
            <Icon icon="ic:outline-edit" className={styles.icon}/>
          </div>
        </div>
        <div className={styles.contentContainer}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.location}> <Icon icon="tdesign:location" className={styles.icon}/> kano, Nigeria</p>
          <div className={styles.stars}>{stars} <span className={styles.starNumber}>4.9</span></div>
          <p className={styles.successRate}>Job Success Rate: 98%</p>
        </div>
      </div>
      
      <p className={styles.progressTitle}>Complete your profile {">"}</p>
      <progress max={100} value={40} className={styles.progress}></progress>
    </div>
  );
};

export default ReviewCard;
