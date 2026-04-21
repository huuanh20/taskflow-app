import { useState, useEffect, useRef } from 'react';
import { Button, Typography, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, UndoOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

const { Text } = Typography;

const MODE_KEYS = ['focus', 'shortBreak', 'longBreak'];
const MODE_CONFIG = {
  focus: { duration: 25 * 60, emoji: '🎯', color: '#635bff', bgGradient: 'linear-gradient(135deg, #ece9ff, #f0ecff)' },
  shortBreak: { duration: 5 * 60, emoji: '☕', color: '#10b981', bgGradient: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' },
  longBreak: { duration: 15 * 60, emoji: '🌴', color: '#3b82f6', bgGradient: 'linear-gradient(135deg, #eff6ff, #f0f9ff)' },
};

export default function FocusTimer() {
  const { t } = useLanguage();
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const currentMode = MODE_CONFIG[mode];
  const totalDuration = currentMode.duration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'focus') setSessions(s => s + 1);
      try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=').play(); } catch(e) {}
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode) => { setIsRunning(false); setMode(newMode); setTimeLeft(MODE_CONFIG[newMode].duration); };
  const reset = () => { setIsRunning(false); setTimeLeft(MODE_CONFIG[mode].duration); };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const modeLabels = {
    focus: t('focus.focus'),
    shortBreak: t('focus.shortBreak'),
    longBreak: t('focus.longBreak'),
  };

  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24, background: '#f1f3f9', borderRadius: 10, padding: 4 }}>
        {MODE_KEYS.map(key => (
          <button key={key} onClick={() => switchMode(key)} style={{
            padding: '8px 14px', borderRadius: 8, border: 'none',
            background: mode === key ? 'white' : 'transparent',
            boxShadow: mode === key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            color: mode === key ? MODE_CONFIG[key].color : '#8b92a5',
            fontWeight: mode === key ? 700 : 500, fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
          }}>
            {MODE_CONFIG[key].emoji} {modeLabels[key]}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 24px' }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="#f1f3f9" strokeWidth="8" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={currentMode.color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#1a1d26', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px', lineHeight: 1 }}>
            {minutes}:{seconds}
          </div>
          <Text style={{ fontSize: 11, color: '#8b92a5', marginTop: 4, display: 'block' }}>
            {currentMode.emoji} {modeLabels[mode]}
          </Text>
        </div>
      </div>

      <Space size={12} style={{ marginBottom: 20 }}>
        <Button type={isRunning ? 'default' : 'primary'} size="large"
          icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={() => setIsRunning(!isRunning)}
          style={{
            height: 48, width: 140, borderRadius: 12, fontWeight: 600, fontSize: 15,
            ...(isRunning ? {} : { background: currentMode.color, borderColor: currentMode.color, boxShadow: `0 6px 20px ${currentMode.color}30` }),
          }}>
          {isRunning ? t('focus.pause') : t('focus.start')}
        </Button>
        <Button size="large" icon={<UndoOutlined />} onClick={reset} style={{ height: 48, width: 48, borderRadius: 12, color: '#8b92a5' }} />
      </Space>

      <div style={{ background: currentMode.bgGradient, borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <ThunderboltOutlined style={{ color: currentMode.color, fontSize: 16 }} />
        <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1d26' }}>
          {sessions} {t('focus.sessionsToday')}
        </Text>
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fafbfd', borderRadius: 10 }}>
        <Text style={{ fontSize: 11, color: '#8b92a5', lineHeight: 1.6 }}>{t('focus.tip')}</Text>
      </div>
    </div>
  );
}
