"use client";
import { useEffect, useState } from "react";
import HappyCustomers from "./HappyCustomers";
import styles from "./styles/allhappycustomers.module.css";

export default function AllHappyCustomers() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/get-main/get-all-spec-cat");
                const data = await response.json();

                if (data?.categories) {
                    setCategories(data.categories);
                } else {
                    console.warn("No categories found");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }

        fetchCategories();
    }, []);

    if (!categories.length) return <div>Loading categories...</div>;

    return (
        <div className={styles.allCategories}>
            <h2 className={styles.categoryHeading}>HomePage</h2>
            <HappyCustomers />
            {categories.map((category) => (
                <div key={category._id} className={styles.categorySection}>
                    <h2 className={styles.categoryHeading}>{category.name}</h2>
                    <HappyCustomers parentSpecificCategoryId={category._id} />
                </div>
            ))}
        </div>
    );
}
