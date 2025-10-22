import React from "react";
import { Icon } from "@iconify/react";
import styles from "../styles/ReviewCardProps.module.css";

interface ReviewCardProps {
  name: string;
  text: string;
  rating: number; // e.g. 4
  imageUrl: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ name, text, rating, imageUrl }) => {
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
            <Icon icon="mdi:pencil" />
          </div>
        </div>
        <div>
          <h3 className={styles.name}>{name}</h3>
          <div className={styles.stars}>{stars}</div>
        </div>
      </div>
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default ReviewCard;
