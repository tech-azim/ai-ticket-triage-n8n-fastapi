"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tooltip,
  Badge,
  Empty,
  Spin,
  Alert,
  Dropdown,
  message,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  FilterOutlined,
  FireOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";

import { fetchTickets } from "@/lib/api";
import { Ticket } from "@/types/ticket";
import UrgencyBadge from "@/components/UrgencyBadge";
import SeverityMeter from "@/components/SeverityMeter";
import StatsCard from "@/components/StatsCard";
import {
  getLanguageFlag,
  STATUS_COLOR,
  parseSimilarIds,
  formatRelative,
  formatTime,
} from "@/lib/util";


const { Title, Text } = Typography;

const URGENCY_FILTER = ["Low", "Medium", "High", "Critical"].map((v) => ({
  text: v,
  value: v,
}));
const STATUS_FILTER = ["pending", "analyzed", "error"].map((v) => ({
  text: v,
  value: v,
}));

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const data = await fetchTickets();
      setTickets(data);
      setLastRefresh(new Date());
      setError(null);
    } catch {
      setError(
        "Cannot connect to backend. Make sure FastAPI is running on localhost:8000",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load, pollingActive]);

  // Derived stats
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    analyzed: tickets.filter((t) => t.status === "analyzed").length,
    critical: tickets.filter((t) => t.urgency_level === "Critical").length,
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 65,
      render: (id) => (
        <Text style={{ color: "#6366f1", fontFamily: "DM Mono", fontSize: 12 }}>
          #{id}
        </Text>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      ellipsis: true,
      render: (title, record) => (
        <Link href={`/tickets/${record.id}`}>
          <Text
            style={{ color: "#e2e8f0", fontWeight: 500, cursor: "pointer" }}
            ellipsis
          >
            {record.status === "pending" && (
              <ClockCircleOutlined
                className="status-pending"
                style={{ color: "#6366f1", marginRight: 6 }}
              />
            )}
            {title}
          </Text>
        </Link>
      ),
    },
    {
      title: "Submitted By",
      dataIndex: "submitted_by",
      width: 180,
      ellipsis: true,
      render: (v) => (
        <Text style={{ color: "#8892a4", fontSize: 12 }}>{v}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      filters: STATUS_FILTER,
      onFilter: (v, r) => r.status === v,
      render: (status) => (
        <Badge
          status={STATUS_COLOR[status] as any}
          text={
            <span
              style={{
                color: "#a0aec0",
                fontSize: 12,
                textTransform: "capitalize",
              }}
            >
              {status}
            </span>
          }
        />
      ),
    },
    {
      title: "Urgency",
      dataIndex: "urgency_level",
      width: 120,
      filters: URGENCY_FILTER,
      onFilter: (v, r) => r.urgency_level === v,
      render: (level) => <UrgencyBadge level={level} />,
    },
    {
      title: "Severity",
      dataIndex: "severity_score",
      width: 160,
      sorter: (a, b) => (a.severity_score || 0) - (b.severity_score || 0),
      render: (score) => <SeverityMeter score={score} />,
    },
    {
      title: "Confidence",
      dataIndex: "confidence_score",
      width: 95,
      sorter: (a, b) => (a.confidence_score || 0) - (b.confidence_score || 0),
      render: (v) =>
        v != null ? (
          <Text
            style={{
              color: v >= 0.8 ? "#52c41a" : v >= 0.5 ? "#fadb14" : "#ff4d4f",
              fontFamily: "DM Mono",
              fontSize: 13,
            }}
          >
            {(v * 100).toFixed(0)}%
          </Text>
        ) : (
          <Text style={{ color: "#4a5568" }}>—</Text>
        ),
    },
    {
      title: "Lang",
      dataIndex: "detected_language",
      width: 65,
      render: (lang) => (
        <Tooltip title={lang?.toUpperCase() || "Unknown"}>
          <span style={{ fontSize: 18 }}>{getLanguageFlag(lang)}</span>
        </Tooltip>
      ),
    },
    {
      title: "Similar",
      dataIndex: "similar_ticket_ids",
      width: 80,
      render: (raw) => {
        const ids = parseSimilarIds(raw);
        return ids.length > 0 ? (
          <Tag color="purple" style={{ fontSize: 11 }}>
            +{ids.length} found
          </Tag>
        ) : (
          <Text style={{ color: "#4a5568", fontSize: 12 }}>—</Text>
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      width: 120,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: "descend",
      render: (dt) => (
        <Tooltip title={formatTime(dt)}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            {formatRelative(dt)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Link href={`/tickets/${record.id}`}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            style={{ color: "#6366f1" }}
          />
        </Link>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: "#e2e8f0" }}>
            Ticket Dashboard
          </Title>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            Auto-refreshes every 5s · Last updated{" "}
            {formatTime(lastRefresh)}
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => {
              setLoading(true);
              load();
            }}
            style={{ borderColor: "#2a2d45", color: "#a0aec0" }}
          >
            Refresh
          </Button>
          <Link href="/submit">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
              }}
            >
              New Ticket
            </Button>
          </Link>
        </Space>
      </div>

      {/* Error banner */}
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{
            marginBottom: 20,
            background: "#2d1515",
            border: "1px solid #ff4d4f44",
          }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Stats Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <StatsCard
            title="Total Tickets"
            value={stats.total}
            icon={<FilterOutlined />}
            color="#6366f1"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Pending Analysis"
            value={stats.pending}
            icon={<ClockCircleOutlined />}
            color="#fadb14"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Analyzed"
            value={stats.analyzed}
            icon={<CheckSquareOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col span={6}>
          <StatsCard
            title="Critical Tickets"
            value={stats.critical}
            icon={<FireOutlined />}
            color="#ff4d4f"
          />
        </Col>
      </Row>

      {/* Table */}
      <div
        style={{
          background: "#13162a",
          border: "1px solid #1f2240",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1f2240",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#e2e8f0", fontWeight: 600 }}>All Tickets</Text>
          <Badge
            count={stats.pending}
            style={{ backgroundColor: "#6366f1" }}
            overflowCount={99}
          >
            <Tag color="default" style={{ margin: 0 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              Pending
            </Tag>
          </Badge>
        </div>
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading && tickets.length === 0}
          pagination={{
            pageSize: 15,
            showTotal: (total) => (
              <span style={{ color: "#6b7280" }}>{total} tickets</span>
            ),
            style: { padding: "12px 20px" },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: "#4a5568" }}>
                    No tickets yet.{" "}
                    <Link href="/submit" style={{ color: "#6366f1" }}>
                      Submit the first one
                    </Link>
                  </span>
                }
                style={{ margin: "40px 0" }}
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => (window.location.href = `/tickets/${record.id}`),
            style: { cursor: "pointer" },
          })}
          rowClassName={(record) =>
            record.urgency_level === "Critical" ? "critical-row" : ""
          }
        />
      </div>

      <style>{`
        .critical-row td {
          background: rgba(255, 77, 79, 0.04) !important;
          border-left: 3px solid #ff4d4f;
        }
        .ant-table-tbody > tr:hover > td {
          background: #1a1d33 !important;
        }
      `}</style>
    </div>
  );
}
