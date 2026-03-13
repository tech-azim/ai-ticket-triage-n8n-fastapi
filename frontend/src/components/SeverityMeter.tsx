'use client';

import { Progress, Tooltip } from 'antd';
import { getSeverityColor } from '@/lib/util';

export default function SeverityMeter({ score }: { score?: number }) {
  if (score == null) return <span style={{ color: '#6b7280' }}>—</span>;
  const color = getSeverityColor(score);
  return (
    <Tooltip title={`Severity: ${score}/100`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
        <Progress
          percent={score}
          size="small"
          strokeColor={color}
          trailColor="#2a2d45"
          showInfo={false}
          style={{ flex: 1, margin: 0 }}
        />
        <span style={{ color, fontWeight: 700, fontSize: 13, minWidth: 28 }}>{score}</span>
      </div>
    </Tooltip>
  );
}