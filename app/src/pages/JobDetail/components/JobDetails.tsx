import React from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/JobDetails.module.css';

interface JobDetailsProps {
  job: {
    budget: string;
    budgetType: string;
    experienceLevel: string;
    projectType: string;
    mandatorySkills: string[];
    niceToHaveSkills: string[];
    tools: string[];
    proposals: string;
    interviewing: string;
    invitesSent: string;
    unansweredInvites: string;
  };
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  return (
    <div className={styles.jobDetails}>
      {/* Budget & Experience */}
      <div className={styles.section}>
        <div className={styles.budgetRow}>
          <Icon icon="bytesize:tag" style={{fontSize:"24px", color:"#000000B2", marginRight:"10px"}}/>
          <div>
            <span className={styles.budgetAmount}>{job.budget}</span>
            <br />
            <span className={styles.budgetType}>{job.budgetType}</span>
          </div>
        </div>
        <div className={styles.experienceRow}>
          <Icon icon="bytesize:tag" style={{fontSize:"24px", color:"#000000B2", marginRight:"10px"}} />
          <div>
          <span className={styles.experienceLevel}>{job.experienceLevel}</span>
          <br />
          <span className={styles.projectType}>{job.projectType}</span>
          </div>
        </div>
      </div>

      {/* Skills and Expertise */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Skill and Expertise</h3>
        
        {/* Mandatory Skills */}
        <div className={styles.skillGroup}>
          <h4 className={styles.skillGroupTitle}>Mandatory skills</h4>
          <div className={styles.skillTags}>
            {job.mandatorySkills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Nice-to-have Skills */}
        <div className={styles.skillGroup}>
          <h4 className={styles.skillGroupTitle}>Nice-to-have skills</h4>
          <div className={styles.skillTags}>
            {job.niceToHaveSkills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className={styles.skillGroup}>
          <h4 className={styles.skillGroupTitle}>Tools</h4>
          <div className={styles.skillTags}>
            {job.tools.map((tool, index) => (
              <span key={index} className={styles.skillTag}>
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Preferred Qualification */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Preferred qualification</h3>
        <p className={styles.emptyText}>No preferred qualifications specified</p>
      </div>

      {/* Activity on this job */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Activity on this job</h3>
        <div className={styles.activityStats}>
          <div className={styles.activityItem}>
            <span className={styles.activityLabel}>Proposals:</span>
            <span className={styles.activityValue}>{job.proposals}</span>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityLabel}>Interviewing:</span>
            <span className={styles.activityValue}>{job.interviewing}</span>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityLabel}>Invites sent:</span>
            <span className={styles.activityValue}>{job.invitesSent}</span>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityLabel}>Unanswered invites:</span>
            <span className={styles.activityValue}>{job.unansweredInvites}</span>
          </div>
        </div>
        
        <div className={styles.premiumNote}>
          <span className={styles.premiumText}>
            Subscribe for <span className={styles.highlight}>premium package</span> to see bid range</span>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
