'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks([...tasks, { id: Date.now(), text, done: false }]);
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
        <h1 className={styles.title}>ToDoリスト</h1>

        <div className={styles.inputRow}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="新しいタスクを入力..."
            maxLength={100}
          />
          <button className={styles.addBtn} onClick={addTask}>追加</button>
        </div>

        <div className={styles.filters}>
          {['all', 'active', 'done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? styles.active : ''}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        <ul className={styles.taskList}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>タスクがありません</li>
          ) : (
            filtered.map(t => (
              <li key={t.id} className={`${styles.taskItem} ${t.done ? styles.done : ''}`}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t.id)}
                />
                <span className={styles.taskLabel}>{t.text}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteTask(t.id)}
                  title="削除"
                >
                  ✕
                </button>
              </li>
            ))
          )}
        </ul>

        {tasks.length > 0 && (
          <p className={styles.summary}>{doneCount} / {tasks.length} 件完了</p>
        )}
      </div>
    </div>
  );
}
