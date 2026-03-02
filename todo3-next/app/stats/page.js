'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const CATEGORIES = [
  { value: 'work',     label: '🏢 仕事', color: '#4f7ef8' },
  { value: 'personal', label: '🏠 個人', color: '#22c55e' },
  { value: 'study',    label: '📚 勉強', color: '#f59e0b' },
];

function DonutChart({ percentage }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPct(percentage), 100);
    return () => clearTimeout(t);
  }, [percentage]);

  const r = 60;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
      <circle
        cx="90" cy="90" r={r}
        fill="none"
        stroke="#4f7ef8"
        strokeWidth="20"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="90" y="84" textAnchor="middle" fontSize="32" fontWeight="800" fill="#1a1a2e">
        {percentage}%
      </text>
      <text x="90" y="104" textAnchor="middle" fontSize="13" fill="#9ca3af">
        完了率
      </text>
    </svg>
  );
}

export default function StatsPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTasks(parsed.map(t => ({ category: 'personal', createdAt: t.id, ...t })));
    }
  }, []);

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const active = total - done;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;

  const today = new Date().toDateString();
  const todayCount = tasks.filter(t => new Date(t.createdAt).toDateString() === today).length;

  const catStats = CATEGORIES.map(c => {
    const catTasks = tasks.filter(t => t.category === c.value);
    const catDone = catTasks.filter(t => t.done).length;
    return { ...c, total: catTasks.length, done: catDone };
  });

  const maxCat = Math.max(...catStats.map(c => c.total), 1);

  const statCards = [
    { label: '合計タスク', value: total,      cls: styles.cardDefault },
    { label: '完了',       value: done,        cls: styles.cardBlue },
    { label: '未完了',     value: active,      cls: styles.cardAmber },
    { label: '今日追加',   value: todayCount,  cls: styles.cardGreen },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>📊 統計ダッシュボード</h1>

        {/* Stat cards */}
        <div className={styles.cards}>
          {statCards.map(c => (
            <div key={c.label} className={`${styles.card} ${c.cls}`}>
              <div className={styles.cardValue}>{c.value}</div>
              <div className={styles.cardLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Donut chart */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>完了率</h2>
          <div className={styles.chartRow}>
            <DonutChart percentage={pct} />
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.dot} style={{ background: '#4f7ef8' }} />
                <span>完了 <strong>{done}</strong> 件</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.dot} style={{ background: '#e5e7eb' }} />
                <span>未完了 <strong>{active}</strong> 件</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>カテゴリ別</h2>
          <div className={styles.catList}>
            {catStats.map(c => (
              <div key={c.value} className={styles.catRow}>
                <div className={styles.catName}>{c.label}</div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${(c.total / maxCat) * 100}%`,
                      background: c.color,
                      transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                    }}
                  />
                </div>
                <div className={styles.catCount} style={{ color: c.color }}>
                  {c.done}/{c.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {total === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <div>タスクページでタスクを追加してください</div>
          </div>
        )}
      </div>
    </div>
  );
}
