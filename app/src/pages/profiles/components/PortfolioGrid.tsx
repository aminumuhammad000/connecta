import { Icon } from '@iconify/react';
import styles from '../styles/ProfileDetails.module.css';
import pot1 from '../../../assets/pot1.png';
import pot2 from '../../../assets/pot2.png';

const portfolioItems = [
  {
    imageUrl: pot1,
    title: "Bloom: Floral E-commerce App",
    author: "Mustapha Hussein",
    likes: 24
  },
  {
    imageUrl: pot2,
    title: "Project Nova:\nAI-Driven Collaboration Platform",
    author: "Mustapha Hussein",
    likes: 30
  },
  {
    imageUrl: pot1,
    title: "Bloom: Floral E-commerce App",
    author: "Mustapha Hussein",
    likes: 24
  },
  {
    imageUrl: pot2,
    title: "Project Nova:\nAI-Driven Collaboration Platform",
    author: "Mustapha Hussein",
    likes: 30
  },
];

type PortfolioItemProps = typeof portfolioItems[0];

const PortfolioCard: React.FC<{ item: PortfolioItemProps }> = ({ item }) => (
  <div className={styles.portfolioCard} style={{ backgroundImage: `url(${item.imageUrl})` }}>
    <div className={styles.portfolioOverlay}>
      <h4 className={styles.portfolioTitle}>{item.title}</h4>
      <div className={styles.portfolioFooter}>
        <p className={styles.portfolioAuthor}>{item.author}</p>
        <div className={styles.portfolioLikes}>
          <Icon icon="lucide:thumbs-up" className={styles.likeIcon} />
          <span className={styles.likeCount}>{item.likes}</span>
        </div>
      </div>
    </div>
  </div>
);

export const PortfolioGrid = () => (
  <div className={styles.portfolioGrid}>
    {portfolioItems.map((item, index) => (
      <PortfolioCard key={index} item={item} />
    ))}
  </div>
);
