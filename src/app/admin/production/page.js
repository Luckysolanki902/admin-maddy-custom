import styles from '../Department.module.css';

export default function Marketing() {
  return (
    <div className={`${styles.container} ${styles.marketing}`}>
      <h1 className={` ${styles.productiontitle}`}>Production</h1>
      <p className={styles.subtitle}>if you cant describe what you are doing , you are not doing that</p>
      
      <div className={styles.buttonContainer}>
        <button className={`${styles.actionButton} ${styles.productionButton}`}>Download Templates</button>
        <button className={`${styles.actionButton} ${styles.productionButton}`}>Customer List</button>
        <button className={`${styles.actionButton} ${styles.productionButton}`}>Add Collection</button>
        <p className={styles.comingSoon}>More coming soon...</p>
      </div>
    </div>
  );
}