import styles from '../Department.module.css';
import Link from 'next/link';
export default function Marketing() {
  return (
    <div className={`${styles.container} ${styles.marketing}`}>
      <h1 className={` ${styles.webdtitle}`}>Web d</h1>
      <p className={styles.subtitle}>Simple, To the point, Bold</p>
      
      <div className={styles.buttonContainer}>
      <Link href={'/admin/manage/orders/orderList'}>
  <button className={`${styles.actionButton} ${styles.webdButton}`}>
    Order List
  </button>
</Link>

        <button className={`${styles.actionButton} ${styles.webdButton}`}>Edit Stickers</button>
        <button className={`${styles.actionButton} ${styles.webdButton}`}>Add Collection</button>
        <p className={styles.comingSoon}>More coming soon...</p>
      </div>
    </div>
  );
}