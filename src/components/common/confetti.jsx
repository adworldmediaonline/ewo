'use client';
import React from 'react';
import styles from './confetti.module.css';

export default function Confetti({
  show = false,
  duration = 3000,
  pieceCount = 50,
}) {
  if (!show) return null;

  return (
    <div className={styles.confetti}>
      {[...Array(pieceCount)].map((_, i) => (
        <div
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${duration / 1000}s`,
            backgroundColor: [
              '#ff6b6b',
              '#4ecdc4',
              '#45b7d1',
              '#f9ca24',
              '#6c5ce7',
              '#a55eea',
            ][Math.floor(Math.random() * 6)],
          }}
        />
      ))}
    </div>
  );
}
