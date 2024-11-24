"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './styles/happycustomers.module.css';

export default function HappyCustomers({ parentSpecificCategoryId, noShadow, noHeading }) {
  const baseImageUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL;
  const [happyCustomers, setHappyCustomers] = useState([]);

  const getFirstLetter = (name) => (name ? name[0] : '');

  useEffect(() => {
    async function fetchHappyCustomers() {
      try {
        const queryParam = parentSpecificCategoryId
          ? `?parentSpecificCategoryId=${parentSpecificCategoryId}`
          : '?homepage=true';
        const response = await fetch(`/api/admin/get-main/get-happy-customers${queryParam}`);
        const data = await response.json();

        if (data?.happyCustomers) {
          setHappyCustomers(data.happyCustomers);
        } else {
          console.warn('No happy customers found');
        }
      } catch (error) {
        console.error("Error fetching happy customers:", error);
      }
    }

    fetchHappyCustomers();
  }, [parentSpecificCategoryId]);

  if (!happyCustomers.length) return null;

  return (
    <div className={`${styles.main}`}>
      <div className={styles.slider}>
        {happyCustomers.map((customer, index) => {
          return (
          <div className={styles.slide} key={index}>
            <Image
              src={`${baseImageUrl}/${customer.photo}`}
              alt={`${customer.name}'s photo`}
              width={500}
              height={500}
              className={styles.image}
            />
            <div className={styles.details}>
              <div className={styles.circle}>{customer.globalDisplayOrder}</div>
              <span className={styles.name}>{customer.name}</span>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
