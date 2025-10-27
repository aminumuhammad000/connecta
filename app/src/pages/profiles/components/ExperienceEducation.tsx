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

export const ExperienceEducation = () => (
  <div className={styles.experienceContainer}>
    <TextBlock suggestion='Add measurable results (e.g., "Improved user engagement by 25%").'>
      <strong>Role:</strong>
      {'\n'}UI/UX Designer – Pioneers
      {'\n'}<strong>Duration:</strong>
      {'\n'}Jan 2023 – Present
      {'\n\n'}<strong>Description:</strong>
      {'\n'}Lorem ipsum dolor sit amet consectetur. Magna in fringilla lectus sed. Id mauris vitae faucibus purus dolor faucibus. Adipiscing vulputate egestas viverra viverra massa. Egestas et iaculis integer morbi purus.
    </TextBlock>

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
  </div>
);
