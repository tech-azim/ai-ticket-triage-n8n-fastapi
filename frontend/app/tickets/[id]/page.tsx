'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, Typography, Tag, Progress, Spin, Alert, Button,
  Divider, Space, Badge, Row, Col,
  Descriptions
} from 'antd';
import {
  ArrowLeftOutlined, ReloadOutlined, FireOutlined, RobotOutlined, GlobalOutlined, LinkOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetchTicket } from '@/lib/api';
import { Ticket } from '@/types/ticket';
import UrgencyBadge from '@/components/UrgencyBadge';
import { getLanguageFlag, parseSimilarIds, STATUS_COLOR, getSeverityColor, formatRelative, formatTime } from '@/lib/util';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

export default function TicketDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchTicket(id);
      setTicket(data);
      setError(null);
    } catch {
      setError('Ticket not found or backend unreachable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while pending
  useEffect(() => {
    if (!ticket || ticket.status !== 'pending') return;
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [ticket, load]);

  const similarIds = parseSimilarIds(ticket?.similar_ticket_ids);

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" tip="Loading ticket...">
            <div style={{ height: 100 }} />
        </Spin>
      </div>
    );

  if (error || !ticket)
    return (
      <div>
        <Link href="/">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#6b7280', marginBottom: 20, padding: 0 }}>
            Back
          </Button>
        </Link>
        <Alert type="error" message={error || 'Ticket not found'} />
      </div>
    );

  const isPending = ticket.status === 'pending';
  const isAnalyzed = ticket.status === 'analyzed';
  const isCritical = ticket.urgency_level === 'Critical';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link href="/">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#6b7280', padding: 0 }}>
            Back to Dashboard
          </Button>
        </Link>
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
          size="small"
          style={{ borderColor: '#2a2d45', color: '#6b7280' }}
        >
          Refresh
        </Button>
      </div>

      {/* Critical Banner */}
      {isCritical && (
        <Alert
          type="error"
          icon={<FireOutlined />}
          message={
            <strong style={{ color: '#ff4d4f' }}>CRITICAL TICKET — Escalation Required</strong>
          }
          description="This ticket has been flagged as critical and an escalation note has been generated."
          style={{ marginBottom: 20, background: '#2d0f0f', border: '1px solid #ff4d4f88' }}
        />
      )}

      {/* Pending banner */}
      {isPending && (
        <Alert
          type="info"
          icon={<RobotOutlined className="status-pending" />}
          message="AI is analyzing this ticket..."
          description="This page will automatically refresh when analysis is complete."
          style={{ marginBottom: 20, background: '#0f1a2d', border: '1px solid #6366f166' }}
        />
      )}

      {/* Header */}
      <Card
        style={{
          background: '#13162a',
          border: isCritical ? '1px solid #ff4d4f55' : '1px solid #1f2240',
          borderRadius: 14,
          marginBottom: 20,
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Space style={{ marginBottom: 8 }}>
              <Text style={{ color: '#6366f1', fontFamily: 'DM Mono', fontSize: 13 }}>#{ticket.id}</Text>
              <Badge status={STATUS_COLOR[ticket.status] as any} text={
                <span style={{ color: '#a0aec0', fontSize: 12, textTransform: 'capitalize' }}>{ticket.status}</span>
              } />
            </Space>
            <Title level={4} style={{ margin: 0, color: '#e2e8f0' }}>{ticket.title}</Title>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 6, display: 'block' }}>
              Submitted by <strong style={{ color: '#a0aec0' }}>{ticket.submitted_by}</strong> · {formatRelative(ticket.created_at)}
            </Text>
          </div>
          <Space wrap>
            <UrgencyBadge level={ticket.urgency_level} />
            {ticket.detected_language && (
              <Tag>
                {getLanguageFlag(ticket.detected_language)} {ticket.detected_language?.toUpperCase()}
              </Tag>
            )}
          </Space>
        </div>

        <Divider style={{ borderColor: '#1f2240', margin: '16px 0' }} />

        <div>
          <Text style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            Description
          </Text>
          <Paragraph style={{ color: '#c0c6d4', marginTop: 8, fontSize: 14, lineHeight: 1.8 }}>
            {ticket.description}
          </Paragraph>
        </div>
      </Card>

      {/* AI Analysis */}
      {isAnalyzed && (
        <Row gutter={16}>
          {/* Left: Scores */}
          <Col xs={24} md={10}>
            <Card
              title={
                <Space>
                  <RobotOutlined style={{ color: '#6366f1' }} />
                  <span style={{ color: '#e2e8f0', fontSize: 14 }}>AI Analysis</span>
                </Space>
              }
              style={{ background: '#13162a', border: '1px solid #1f2240', borderRadius: 14, marginBottom: 16 }}
              styles={{ header: { borderBottom: '1px solid #1f2240' }, body: { padding: '20px' } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                {/* Urgency */}
                <div>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>Urgency Level</Text>
                  <div style={{ marginTop: 6 }}>
                    <UrgencyBadge level={ticket.urgency_level} />
                  </div>
                </div>

                {/* Severity Score */}
                <div>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>Severity Score</Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      percent={ticket.severity_score}
                      strokeColor={getSeverityColor(ticket.severity_score || 0)}
                      trailColor="#2a2d45"
                      format={(p) => (
                        <span style={{ color: getSeverityColor(ticket.severity_score || 0), fontFamily: 'DM Mono' }}>
                          {p}/100
                        </span>
                      )}
                    />
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>AI Confidence</Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      percent={Math.round((ticket.confidence_score || 0) * 100)}
                      strokeColor="#6366f1"
                      trailColor="#2a2d45"
                      format={(p) => (
                        <span style={{ color: '#6366f1', fontFamily: 'DM Mono' }}>{p}%</span>
                      )}
                    />
                  </div>
                </div>

                {/* Language */}
                <div>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>Detected Language</Text>
                  <div style={{ marginTop: 6 }}>
                    <Tag icon={<GlobalOutlined />}>
                      {getLanguageFlag(ticket.detected_language)} {ticket.detected_language?.toUpperCase() || '—'}
                    </Tag>
                  </div>
                </div>

                {/* Similar tickets */}
                {similarIds.length > 0 && (
                  <div>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>Similar Tickets</Text>
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {similarIds.map((sid) => (
                        <Link key={sid} href={`/tickets/${sid}`}>
                          <Tag
                            icon={<LinkOutlined />}
                            color="purple"
                            style={{ cursor: 'pointer' }}
                          >
                            #{sid}
                          </Tag>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Right: Reasoning + Escalation */}
          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <RobotOutlined style={{ color: '#8b5cf6' }} />
                  <span style={{ color: '#e2e8f0', fontSize: 14 }}>AI Reasoning</span>
                </Space>
              }
              style={{ background: '#13162a', border: '1px solid #1f2240', borderRadius: 14, marginBottom: 16 }}
              styles={{ header: { borderBottom: '1px solid #1f2240' }, body: { padding: '20px' } }}
            >
              <Paragraph
                style={{
                  color: '#c0c6d4',
                  fontSize: 13,
                  lineHeight: 1.8,
                  fontFamily: 'DM Mono',
                  background: '#0d0f1a',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid #1f2240',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ticket.reasoning || '—'}
              </Paragraph>
            </Card>

            {/* Escalation note if critical */}
            {isCritical && ticket.reasoning?.includes('ESCALATION') && (
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span style={{ color: '#ff4d4f', fontSize: 14 }}>Escalation Note</span>
                  </Space>
                }
                style={{
                  background: '#200f0f',
                  border: '1px solid #ff4d4f55',
                  borderRadius: 14,
                }}
                styles={{ header: { borderBottom: '1px solid #ff4d4f33' }, body: { padding: '20px' } }}
              >
                <Paragraph style={{ color: '#fca5a5', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                  {ticket.reasoning}
                </Paragraph>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* Timestamps */}
      <Card
        style={{ background: '#13162a', border: '1px solid #1f2240', borderRadius: 14 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Descriptions
          size="small"
          items={[
            {
              key: 'created',
              label: <span style={{ color: '#6b7280' }}>Created</span>,
              children: <span style={{ color: '#a0aec0' }}>{formatTime(ticket.created_at)}</span>,
            },
            {
              key: 'updated',
              label: <span style={{ color: '#6b7280' }}>Last Updated</span>,
              children: <span style={{ color: '#a0aec0' }}>{formatTime(ticket.updated_at)}</span>,
            },
            {
              key: 'status',
              label: <span style={{ color: '#6b7280' }}>Status</span>,
              children: (
                <Badge
                  status={STATUS_COLOR[ticket.status] as any}
                  text={<span style={{ color: '#a0aec0', textTransform: 'capitalize' }}>{ticket.status}</span>}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}