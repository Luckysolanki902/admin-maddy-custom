import styles from '../Department.module.css';
import Link from 'next/link';
export default function Marketing() {
  return (
    <div className={`${styles.container} ${styles.marketing}`}>
      <h1 className={` ${styles.designtitle}`}>Design</h1>
      <p className={styles.subtitle}>Design is not how it looks, more about how it works</p>
      
      <div className={styles.buttonContainer}>
        <Link  href="" className={`${styles.actionButton} ${styles.designButton}`}>Edit Stickers</Link>
        <Link  href=""  className={`${styles.actionButton} ${styles.designButton}`}>Add Collection</Link>
        <Link  href="" className={`${styles.actionButton} ${styles.designButton}`}>Add stickers</Link>
        <p className={styles.comingSoon}>More coming soon...</p>
      </div>
    </div>
  );
}
