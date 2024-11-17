import styles from '../Department.module.css';
import Link from 'next/link';
export default function Marketing() {
  return (
    <div className={`${styles.container} ${styles.marketing}`}>
      <h1 className={` ${styles.productiontitle}`}>Production</h1>
      <p className={styles.subtitle}>if you cant describe what you are doing , you are not doing that</p>
      
      <div className={styles.buttonContainer}>
        <Link href="" className={`${styles.actionButton} ${styles.productionButton}`}>Download Templates</Link>
        <Link href="" className={`${styles.actionButton} ${styles.productionButton}`}>Customer List</Link>
        <Link href="" className={`${styles.actionButton} ${styles.productionButton}`}>Add Collection</Link>
        <p className={styles.comingSoon}>More coming soon...</p>
      </div>
    </div>
  );
}