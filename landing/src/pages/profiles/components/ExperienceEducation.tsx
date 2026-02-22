import styles from '../styles/ProfileDetails.module.css';

const TextBlock: React.FC<{ children: React.ReactNode, suggestion?: string }> = ({ children, suggestion }) => (
  <div className={styles.textBlock}>
    <p className={styles.blockText}>
      {children}
    </p>
    {suggestion && (
      <p className={styles.suggestionText}>
        AI Suggestion: {suggestion}
      </p>
    )}
  </div>
);
export const ExperienceEducation: React.FC<{ education?: any[]; employment?: any[] }> = ({ education = [], employment = [] }) => (
  <div className={styles.experienceContainer}>
    {employment.length > 0 ? (
      employment.map((emp, idx) => (
        <TextBlock key={idx} suggestion={emp.suggestion}>
          <strong>Role:</strong>
          {'\n'}{emp.position} – {emp.company}
          {'\n'}<strong>Duration:</strong>
          {'\n'}{emp.startDate ? new Date(emp.startDate).toLocaleDateString() : ''} – {emp.endDate ? new Date(emp.endDate).toLocaleDateString() : 'Present'}
          {'\n\n'}<strong>Description:</strong>
          {'\n'}{emp.description || ''}
        </TextBlock>
      ))
    ) : (
      <TextBlock suggestion='Add measurable results (e.g., "Improved user engagement by 25%").'>
        <strong>Role:</strong>
        {'\n'}UI/UX Designer – Pioneers
        {'\n'}<strong>Duration:</strong>
        {'\n'}Jan 2023 – Present
        {'\n\n'}<strong>Description:</strong>
        {'\n'}Lorem ipsum dolor sit amet consectetur. Magna in fringilla lectus sed. Id mauris vitae faucibus purus dolor faucibus. Adipiscing vulputate egestas viverra viverra massa. Egestas et iaculis integer morbi purus.
      </TextBlock>
    )}

    {education.length > 0 ? (
      education.map((edu, idx) => (
        <TextBlock key={idx} suggestion={edu.suggestion}>
          <strong>Education</strong>
          {'\n'}{edu.institution}
          {'\n'}<strong>Degree:</strong>
          {'\n'}{edu.degree}
          {'\n'}<strong>Duration:</strong>
          {'\n'}{edu.startDate ? new Date(edu.startDate).getFullYear() : ''} – {edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
          {'\n\n'}<strong>Description:</strong>
          {'\n'}{edu.description || ''}
        </TextBlock>
      ))
    ) : (
      <TextBlock suggestion='Add key coursework or awards (e.g., "Project on E-commerce UI Design ranked top in class").'>
        <strong>Education</strong>
        {'\n'}Al-Qalam University, Katsina
        {'\n'}<strong>Degree:</strong>
        {'\n'}BSc. Computer Science
        {'\n'}<strong>Duration:</strong>
        {'\n'}2019 – 2024
        {'\n\n'}<strong>Description:</strong>
        {'\n'}Gained strong knowledge in software development, design principles, and human-computer interaction.
      </TextBlock>
    )}
  </div>
);
