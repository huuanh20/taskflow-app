import { useState, useEffect } from 'react';
import { Typography, Badge } from 'antd';
import { useLanguage } from '../contexts/LanguageContext';

const { Text } = Typography;

export default function LiveClock({ tasks = [] }) {
  const [time, setTime] = useState(new Date());
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return { text: t('greeting.morning'), emoji: '🌅', color: '#f59e0b' };
    if (h < 18) return { text: t('greeting.afternoon'), emoji: '☀️', color: '#3b82f6' };
    return { text: t('greeting.evening'), emoji: '🌙', color: '#8b5cf6' };
  };

  const greeting = getGreeting();
  const dayNames = t('calendar.weekdays');
  const monthNames = t('calendar.months');
  const calDayLabels = t('calendar.days');

  const year = time.getFullYear();
  const month = time.getMonth();
  const today = time.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  const todayStr = time.toISOString().split('T')[0];
  const dueTodayCount = tasks.filter(t => t.dueDate && t.dueDate.startsWith(todayStr)).length;

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, color: greeting.color, fontWeight: 600 }}>
          {greeting.emoji} {greeting.text}
        </Text>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 20 }}>
        <span style={{ fontSize: 48, fontWeight: 800, color: '#1a1d26', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px', lineHeight: 1 }}>{hours}</span>
        <span style={{ fontSize: 48, fontWeight: 300, color: '#635bff', animation: 'blink 1s ease-in-out infinite', lineHeight: 1 }}>:</span>
        <span style={{ fontSize: 48, fontWeight: 800, color: '#1a1d26', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px', lineHeight: 1 }}>{minutes}</span>
        <span style={{ fontSize: 20, fontWeight: 500, color: '#8b92a5', fontVariantNumeric: 'tabular-nums', marginLeft: 4, alignSelf: 'flex-end', lineHeight: 1.6 }}>{seconds}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 14, color: '#5c6370', fontWeight: 500 }}>
          {Array.isArray(dayNames) ? dayNames[time.getDay()] : ''}, {today} {Array.isArray(monthNames) ? monthNames[month] : ''} {year}
        </Text>
        {dueTodayCount > 0 && (
          <div style={{ marginTop: 6 }}>
            <Badge status="processing" />
            <Text style={{ fontSize: 12, color: '#3b82f6', marginLeft: 6, fontWeight: 600 }}>
              {dueTodayCount} {t('dashboard.dueTodayCount')}
            </Text>
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: '#1a1d26', textTransform: 'uppercase', letterSpacing: 1 }}>
            {Array.isArray(monthNames) ? monthNames[month] : ''} {year}
          </Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
          {(Array.isArray(calDayLabels) ? calDayLabels : []).map(d => (
            <div key={d} style={{ fontSize: 10, fontWeight: 600, color: '#b0b7c8', padding: '4px 0' }}>{d}</div>
          ))}
          {calDays.map((day, i) => (
            <div key={i} style={{
              fontSize: 11, fontWeight: day === today ? 700 : 400,
              color: day === today ? 'white' : day ? '#5c6370' : 'transparent',
              background: day === today ? '#635bff' : 'transparent',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', transition: 'all 0.2s', cursor: day ? 'pointer' : 'default',
            }}>
              {day || ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
