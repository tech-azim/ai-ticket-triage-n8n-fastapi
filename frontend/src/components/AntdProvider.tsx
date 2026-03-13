'use client';

import { ConfigProvider, theme as antdTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

const THEME = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorBgBase: '#0d0f1a',
    colorBgContainer: '#13162a',
    colorBgElevated: '#1a1d33',
    colorBorderSecondary: '#2a2d45',
    borderRadius: 10,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    fontSize: 14,
  },
  components: {
    Card: {
      colorBgContainer: '#13162a',
    },
    Table: {
      colorBgContainer: '#13162a',
      headerBg: '#1a1d33',
    },
    Layout: {
      colorBgBody: '#0d0f1a',
      headerBg: '#0d0f1a',
      siderBg: '#0d0f1a',
    },
    Menu: {
      darkItemBg: '#0d0f1a',
      darkSubMenuItemBg: '#13162a',
    },
  },
};

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider theme={THEME}>{children}</ConfigProvider>
    </StyleProvider>
  );
}