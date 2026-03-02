'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const CATEGORIES = [
  { value: 'work',     label: '🏢 仕事', color: '#4f7ef8' },
  { value: 'personal', label: '🏠 個人', color: '#22c55e' },
  { value: 'study',    label: '📚 勉強', color: '#f59e0b' },
];

export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('personal');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTasks(parsed.map(t => ({ category: 'personal', createdAt: t.id, ...t })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks([...tasks, { id: Date.now(), text, done: false, category, createdAt: Date.now() }]);
    setInput('');
  }

  function toggleTask(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = tasks.filter(t => t.done).length;
  const filterLabels = { all: 'すべて', active: '未完了', done: '完了済み' };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>タスク一覧</h1>
          {tasks.length > 0 && (
            <span className={styles.badge}>{doneCount} / {tasks.length} 完了</span>
          )}
        </div>

        <div className={styles.inputSection}>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              maxLength={100}
              className={styles.textInput}
            />
            <button className={styles.addBtn} onClick={addTask}>追加</button>
          </div>
          <div className={styles.categoryRow}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`${styles.catBtn} ${category === c.value ? styles.catActive : ''}`}
                style={category === c.value ? { background: c.color, borderColor: c.color } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filters}>
          {['all', 'active', 'done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? styles.filterActive : styles.filterBtn}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        <ul className={styles.taskList}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>タスクがありません</li>
          ) : (
            filtered.map(t => {
              const cat = CATEGORIES.find(c => c.value === t.category) || CATEGORIES[1];
              return (
                <li
                  key={t.id}
                  className={`${styles.taskItem} ${t.done ? styles.done : ''}`}
                  style={{ borderLeftColor: cat.color }}
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTask(t.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.taskBody}>
                    <span className={styles.taskLabel}>{t.text}</span>
                    <span
                      className={styles.catTag}
                      style={{ color: cat.color, background: cat.color + '20' }}
                    >
                      {cat.label}
                    </span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => deleteTask(t.id)}>✕</button>
                </li>
              );
            })
          )}
        </ul>

        {tasks.length > 0 && (
          <p className={styles.summary}>残り {tasks.length - doneCount} 件</p>
        )}
      </div>
    </div>
  );
}
