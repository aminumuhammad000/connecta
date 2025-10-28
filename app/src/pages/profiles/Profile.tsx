import { ProfileHeader } from './components/ProfileHeader';
import { SectionHeader } from './components/SectionHeader';
import { PortfolioGrid } from './components/PortfolioGrid';
import { ExperienceEducation } from './components/ExperienceEducation';
import Header from '../../components/Header';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();

  const handleAddPortfolio = () => {
    navigate('/add-portfolio');
  };
  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1 className={styles.pageTitle}>My profile</h1>
          <ProfileHeader />

          <div className={styles.sections}>
            <section className={styles.section}>
              <SectionHeader title="Skills / Tolls" variant="muted" />
              <div className={styles.sectionContent}>
                <p className={styles.skillsText}>
                  {'UI/UX Design, Product Design, Video Editing\nFigma, A. Premiere pro'}
                </p>
                <p className={styles.rateText}>₦ 10,000/hr</p>
              </div>
              <hr className={styles.divider} />
            </section>

            <section className={styles.section}>
              <SectionHeader 
                title="Professional Summary" 
                variant="muted" 
                ActionIcon={() => <Icon icon="lucide:pencil" />} 
              />
              <div className={styles.sectionContent}>
                <p className={styles.summaryText}>
                  A skilled problem solver and professional UI/UX 
                  designer with over 4 years of experience in creating 
                  intuitive and aesthetically pleasing digital interface. Also...
                  <a href="#" className={styles.moreLink}>more</a>
                </p>
              </div>
              <hr className={styles.divider} />
            </section>

            <section className={styles.section}>
              <SectionHeader 
                title="Portfolio" 
                ActionIcon={() => <Icon icon="lucide:plus" />} 
                onActionClick={handleAddPortfolio}
              />
              <PortfolioGrid />
              <hr className={styles.divider} />
            </section>

            <section className={styles.section}>
              <SectionHeader title="Experience & Education" />
              <ExperienceEducation />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
