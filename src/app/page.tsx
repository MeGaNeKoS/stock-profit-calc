'use client';

import Calculator from '@/components/Calculator';
import './globals.css';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stock Sell Price Calculator</h1>
      <Calculator />
    </div>
  );
}
