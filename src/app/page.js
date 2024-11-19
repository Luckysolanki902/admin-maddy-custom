'use client';
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from 'react';
import Link from 'next/link';
import TextField from '@mui/material/TextField';
import styles from './page.module.css';
import NotSignedIn from "@/components/full-page-comps/NotSignedIn";

export default function Home() {
  const [clickSequence, setClickSequence] = useState([]);
  const [textFieldVisible, setTextFieldVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [masterAdminVisible, setMasterAdminVisible] = useState(false);

  const correctSequence = ["Love", "Your", "Work"];
  const masterAdminPassword = process.env.NEXT_PUBLIC_MASTER_ADMIN_PASS;

  const handleHeadingClick = (word) => {
    setClickSequence((prevSequence) => {
      const newSequence = [...prevSequence, word];

      if (newSequence.length <= correctSequence.length) {
        const isMatch = newSequence.every((val, index) => val === correctSequence[index]);
        if (isMatch && newSequence.length === correctSequence.length) {
          setTextFieldVisible(true); // Show text field when the sequence is completed
        }
      } else {
        return [];
      }

      return newSequence;
    });
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Handle password submission when Enter is pressed
      if (inputValue === masterAdminPassword) {
        setMasterAdminVisible(true); // Reveal Master Admin link
        setTextFieldVisible(false); // Hide the text field
      } else {
        alert('Incorrect password');
      }
    }
  };

  return (
    <>
      <SignedOut>
        <NotSignedIn />
      </SignedOut>
      <SignedIn>
        <div className={styles.container}>
          {!textFieldVisible ? (
            <h1 className={styles.heading}>
              <span onClick={() => handleHeadingClick("Love")} className={styles.love}>Love </span>
              <span onClick={() => handleHeadingClick("Your")} className={styles.your}>your </span>
              <span onClick={() => handleHeadingClick("Work")} className={styles.work}>work</span>
            </h1>
          ) : (
            <div className={styles.inputContainer}>
              <TextField
                label="Enter Admin Password"
                variant="outlined"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} // Listen for Enter key
                fullWidth
                sx={{mb:5, mt: 5}}
                className={styles.heading}
              />
            </div>
          )}

         {!textFieldVisible && <p className={styles.subheading}>life is too short to hate it</p>}

          <div className={styles.grid}>
            <Link href="/admin/market" className={styles.box} style={{ 'boxShadow': '0px 0px 11.34px rgba(255, 255, 0, 0.4)' }}>Marketing</Link>
            <Link href="/admin/design" className={styles.box} style={{ 'boxShadow': '0px 0px 11.34px rgba(0, 255, 229, 0.4)' }}>Design </Link>
            <Link href="/admin/dev" className={styles.box} style={{ 'boxShadow': '0px 0px 11.34px rgba(255, 89, 144, 0.4)' }}>Web-Dev</Link>
            <Link href="/admin/production" className={styles.box} style={{ 'boxShadow': '0px 0px 11.34px rgba(255, 255, 255, 0.4)' }}>Production</Link>
          {masterAdminVisible && (
            <Link href="/admin" className={styles.box}>
              Master Admin
            </Link>
          )}
          </div>

        </div>
      </SignedIn>
    </>
  );
}
