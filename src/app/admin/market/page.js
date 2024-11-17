import styles from '../Department.module.css';

export default function Marketing() {
  return (
    <div className={`${styles.container} ${styles.marketing}`}>
      <h1 className={` ${styles.marketingtitle}`}>Marketing</h1>
      <p className={styles.subtitle}>Simple, To the point, Bold</p>
      
      <div className={styles.buttonContainer}>
        <button className={`${styles.actionButton} ${styles.marketingButton}`}>Track sales</button>
        <button className={`${styles.actionButton} ${styles.marketingButton}`}>Manage coupons</button>
        <p className={styles.comingSoon}>More coming soon...</p>
      </div>
    </div>
  );
}
