// app/page.js

'use client';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";


import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import NotSignedIn from "@/components/full-page-comps/NotSignedIn";

export default function Home() {
  const [masterAdminVisible, setMasterAdminVisible] = useState(false);
  const [clicks, setClicks] = useState(0);

  const handleHeadingClick = () => {
    setClicks((prev) => prev + 1);

    // If all words are clicked in sequence, show the master admin block
    if (clicks === 2) {
      setMasterAdminVisible(true);
    }
  };

  return (
    <>
      <SignedOut>
        <NotSignedIn />
      </SignedOut>
      <SignedIn>

        <div className={styles.container}>
          <h1 className={styles.heading}>
            <span onClick={handleHeadingClick} className={styles.love}>Love </span>
            <span onClick={handleHeadingClick} className={styles.your}>your </span>
            <span onClick={handleHeadingClick} className={styles.work}>work</span>
          </h1>
          <p className={styles.subheading}>life is too short to hate it</p>

          <div className={styles.grid}>
            <Link href="/admin/market" className={styles.box}>Marketing</Link>
            <Link href="/admin/design" className={styles.box} style={{ 'box-shadow': '0px 0px 11.34px #00FFE5' }}>Design </Link>
            <Link href="/admin/dev" className={styles.box} style={{ 'box-shadow': '0px 0px 11.34px #FF5990' }}>Web-Dev</Link>
            <Link href="/admin/production" className={styles.box} style={{ 'box-shadow': '0px 0px 11.34px #FFFFFF' }}>Production</Link>
          </div>

          {masterAdminVisible && (
            <Link href="/admin" className={styles.box}>
              Master Admin
            </Link>
          )}
        </div>
      </SignedIn>
    </>

  );
}
