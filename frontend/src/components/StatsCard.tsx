'use client';

import { Card, Statistic } from 'antd';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

export default function StatsCard({ title, value, icon, color, suffix }: StatsCardProps) {
  return (
    <Card
      style={{
        background: '#13162a',
        border: '1px solid #1f2240',
        borderRadius: 14,
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Statistic
          title={<span style={{ color: '#6b7280', fontSize: 13 }}>{title}</span>}
          value={value}
          suffix={suffix}
          valueStyle={{ color: '#e2e8f0', fontSize: 28, fontWeight: 700 }}
        />
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: color + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}