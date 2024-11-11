"use client";
import Link from "next/link";
import styles from "./AdminPage.module.css"; // Import the new CSS file for the page

export default function AdminPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>
      
      <div className={styles.buttonContainer}>
        <Link href="/admin/userRole" className={styles.button}>
          Manage User Role
        </Link>
        <Link href="/admin/pathRole" className={styles.button}>
          Manage Path Role
        </Link>
      </div>
    </div>
  );
}
