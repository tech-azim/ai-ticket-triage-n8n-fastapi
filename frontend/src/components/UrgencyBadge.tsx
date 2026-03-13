'use client';

import { Tag } from 'antd';
import { FireOutlined, WarningOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { URGENCY_COLOR } from '@/lib/util';

const ICONS: Record<string, React.ReactNode> = {
  Critical: <FireOutlined />,
  High: <WarningOutlined />,
  Medium: <InfoCircleOutlined />,
  Low: <CheckCircleOutlined />,
};

export default function UrgencyBadge({ level }: { level?: string }) {
  if (!level) return <Tag color="default">—</Tag>;
  return (
    <Tag color={URGENCY_COLOR[level] || 'default'} icon={ICONS[level]}>
      {level}
    </Tag>
  );
}