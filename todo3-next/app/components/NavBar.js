'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>✅ ToDo App</span>
      <div className={styles.links}>
        <Link href="/" className={pathname === '/' ? styles.active : styles.link}>
          📋 タスク
        </Link>
        <Link href="/stats" className={pathname === '/stats' ? styles.active : styles.link}>
          📊 統計
        </Link>
      </div>
    </nav>
  );
}
