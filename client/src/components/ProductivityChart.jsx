import { useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ProductivityChart({ tasks = [] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate tasks completed per day this week
  const today = new Date();
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = DAYS[date.getDay()];
    const completed = tasks.filter(t => 
      t.status === 'Done' && t.updatedAt && t.updatedAt.startsWith(dateStr)
    ).length;
    weekData.push({ day: dayName, value: completed, date: dateStr, isToday: i === 0 });
  }

  // Use sample data if no real data
  const hasData = weekData.some(d => d.value > 0);
  const sampleData = [3, 5, 2, 7, 4, 6, 3];
  const chartData = hasData ? weekData.map(d => d.value) : sampleData;
  const maxValue = Math.max(...chartData, 1);

  // SVG dimensions
  const W = 320, H = 140, PX = 30, PY = 15;
  const innerW = W - PX * 2, innerH = H - PY * 2;

  // Calculate points
  const points = chartData.map((val, i) => ({
    x: PX + (i / (chartData.length - 1)) * innerW,
    y: PY + innerH - (val / maxValue) * innerH,
  }));

  // Create smooth path using cubic bezier
  const linePath = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = p.x - (p.x - prev.x) * 0.4;
    return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
  }).join(' ');

  // Area path (line + bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PY} L ${PX} ${H - PY} Z`;

  // Y-axis labels
  const yLabels = [0, Math.ceil(maxValue / 2), maxValue];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ position: 'relative' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635bff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#635bff" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#635bff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.map((val, i) => {
            const y = PY + innerH - (val / maxValue) * innerH;
            return (
              <g key={i}>
                <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#f1f3f9" strokeWidth="1" />
                <text x={PX - 8} y={y + 4} textAnchor="end" fill="#b0b7c8" fontSize="9" fontFamily="Inter">{val}</text>
              </g>
            );
          })}

          {/* Animated area fill */}
          <path d={areaPath} fill="url(#areaGradient)"
            style={{
              opacity: animated ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          />

          {/* Animated line */}
          <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              strokeDasharray: animated ? 'none' : '1000',
              strokeDashoffset: animated ? '0' : '1000',
              transition: 'stroke-dashoffset 1.2s ease',
            }}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={animated ? 4 : 0} fill="white"
                stroke="#635bff" strokeWidth="2"
                style={{ transition: `r 0.3s ease ${0.1 * i}s` }}
              />
              {weekData[i]?.isToday && (
                <circle cx={p.x} cy={p.y} r={animated ? 8 : 0} fill="#635bff" fillOpacity="0.15"
                  style={{ transition: `r 0.4s ease ${0.1 * i}s` }}
                />
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={H - 2} textAnchor="middle"
              fill={weekData[i]?.isToday ? '#635bff' : '#b0b7c8'}
              fontSize="10" fontWeight={weekData[i]?.isToday ? 700 : 400}
              fontFamily="Inter">
              {weekData[i]?.day}
            </text>
          ))}
        </svg>
      </div>

      {!hasData && (
        <Text style={{ fontSize: 11, color: '#b0b7c8', display: 'block', textAlign: 'center', marginTop: 8 }}>
          📊 Dữ liệu mẫu — hoàn thành task để thấy biểu đồ thật
        </Text>
      )}
    </div>
  );
}
