"use client"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import styles from './SignIn.module.css';

export default function NotSignedIn() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>
          <Image src={"/images/dark-circular-logo.png"} width={100} height={100} alt=""/>
        </div>
        <p className={styles.title}>Maddycustom</p>
        <p className={styles.subtitle}>a team that makes every ride unique</p>
        <SignInButton className={styles.button}>Sign In</SignInButton>
      </div>
    </div>
  );
}
