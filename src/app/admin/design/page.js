import styles from '../Department.module.css';

export default function Marketing() {
  return (
    <div className={`${styles.container} ${styles.marketing}`}>
      <h1 className={` ${styles.designtitle}`}>Design</h1>
      <p className={styles.subtitle}>Design is not how it looks, more about how it works</p>
      
      <div className={styles.buttonContainer}>
        <button className={`${styles.actionButton} ${styles.designButton}`}>Edit Stickers</button>
        <button className={`${styles.actionButton} ${styles.designButton}`}>Add Collection</button>
        <button className={`${styles.actionButton} ${styles.designButton}`}>Add stickers</button>
        <p className={styles.comingSoon}>More coming soon...</p>
      </div>
    </div>
  );
}
