"use client"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import styles from './SignIn.module.css';

export default function NotSignedIn() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
          <Image className={styles.logo} src={"/images/dark-circular-logo.png"} width={100} height={100} alt=""/>
        <p className={styles.title}>Maddycustom</p>
        <p className={styles.subtitle}>a team that makes every ride unique</p>
        <SignInButton mode="modal" forceRedirectUrl="/" className={styles.button}>Sign In</SignInButton>
      </div>
    </div>
  );
}
