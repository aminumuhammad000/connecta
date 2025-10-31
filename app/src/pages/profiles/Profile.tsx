import React from 'react';
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
  const [profile, setProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAddPortfolio = () => {
    navigate('/add-portfolio');
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { getProfile } = await import('../../api/profile');
        const data = await getProfile();
        if (mounted) setProfile(data);
      } catch (err: any) {
        if (mounted) setError(err?.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1 className={styles.pageTitle}>My profile</h1>
          {loading && <div>Loading profile...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && (
            <>
              <ProfileHeader
                name={profile?.user ? `${profile.user.firstName} ${profile.user.lastName}` : undefined}
                location={profile?.location}
                profileImage={profile?.user?.profileImage}
                rating={typeof profile?.rating === 'number' ? profile.rating : undefined}
                successRate={profile?.successRate}
              />

              <div className={styles.sections}>
                <section className={styles.section}>
                  <SectionHeader title="Skills / Tools" variant="muted" />
                  <div className={styles.sectionContent}>
                    <p className={styles.skillsText}>
                      {Array.isArray(profile?.skills) ? profile.skills.join(', ') : ''}
                    </p>
                    {profile?.hourlyRate && (
                      <p className={styles.rateText}>{`₦ ${profile.hourlyRate}/hr`}</p>
                    )}
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
                    {profile?.summary || profile?.resume ? (
                      <p className={styles.summaryText}>
                        {profile.summary || profile.resume}
                      </p>
                    ) : (
                      <p className={styles.summaryText} />
                    )}
                  </div>
                  <hr className={styles.divider} />
                </section>

                <section className={styles.section}>
                  <SectionHeader 
                    title="Portfolio" 
                    ActionIcon={() => <Icon icon="lucide:plus" />} 
                    onActionClick={handleAddPortfolio}
                  />
                  <PortfolioGrid items={profile?.portfolio || profile?.projects || []} />
                  <hr className={styles.divider} />
                </section>

                <section className={styles.section}>
                  <SectionHeader title="Experience & Education" />
                  <ExperienceEducation education={profile?.education} employment={profile?.employment} />
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
