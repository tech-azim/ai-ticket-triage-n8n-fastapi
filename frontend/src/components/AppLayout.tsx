"use client";

import { Layout, Menu, Typography, Badge, Space } from "antd";
import {
  DashboardOutlined,
  PlusCircleOutlined,
  BugOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: <Link href="/">Dashboard</Link>,
  },
  {
    key: "/submit",
    icon: <PlusCircleOutlined />,
    label: <Link href="/submit">New Ticket</Link>,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Layout>
      <Sider
        width={220}
        style={{
          background: "#0d0f1a",
          borderRight: "1px solid #1f2240",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid #1f2240",
          }}
        >
          <Space align="center" size={10}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <RobotOutlined style={{ color: "#fff" }} />
            </div>
            <div>
              <div
                style={{
                  color: "#e2e8f0",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.2,
                }}
              >
                TicketAI
              </div>
              <div style={{ color: "#6366f1", fontSize: 11, letterSpacing: 1 }}>
                TRIAGE SYSTEM
              </div>
            </div>
          </Space>
        </div>

        {/* Nav */}
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[pathname]}
          items={NAV_ITEMS}
          style={{ background: "transparent", border: "none", marginTop: 12 }}
        />

        {/* Footer badge */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
            background: "#1a1d33",
            border: "1px solid #2a2d45",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <Space>
            <ThunderboltOutlined style={{ color: "#6366f1" }} />
            <div>
              <div style={{ color: "#a0aec0", fontSize: 11 }}>Powered by</div>
              <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>
                Groq + LLaMA 3.3
              </div>
            </div>
          </Space>
        </div>
      </Sider>

      {/* Main */}
      <Layout style={{ marginLeft: 220, background: "#0d0f1a" }}>
        <Header
          style={{
            background: "#0d0f1a",
            borderBottom: "1px solid #1f2240",
            padding: "0 28px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            AI-powered ticket classification & routing
          </Text>
          <Badge
            status="processing"
            text={
              <span style={{ color: "#52c41a", fontSize: 12 }}>
                System Online
              </span>
            }
          />
        </Header>
        <Content style={{ padding: "28px", minHeight: "calc(100vh - 60px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
