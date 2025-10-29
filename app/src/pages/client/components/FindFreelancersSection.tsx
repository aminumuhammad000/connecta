import { Icon } from '@iconify/react';
import styles from '../styles/FindFreelancersSection.module.css';

interface Freelancer {
  id: string;
  name: string;
  role: string;
  rating: number | string;
  avatar: string;
}

interface FindFreelancersSectionProps {
  freelancers: Freelancer[];
}

const FindFreelancersSection = ({ freelancers }: FindFreelancersSectionProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Find Top Freelancers</h2>
      <p className={styles.subtitle}>AI-powered recommendations based on your needs.</p>

      {freelancers.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon="material-symbols:group-outline" className={styles.emptyIcon} />
          <p>No freelancers available at the moment</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {freelancers.map((freelancer) => (
            <div key={freelancer.id} className={styles.card}>
              <img 
                src={freelancer.avatar} 
                alt={freelancer.name} 
                className={styles.avatar}
              />
              <h3 className={styles.name}>{freelancer.name}</h3>
              <p className={styles.role}>{freelancer.role}</p>
              <div className={styles.rating}>
                <Icon icon="material-symbols:star" className={styles.starIcon} />
                <span>{freelancer.rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindFreelancersSection;
