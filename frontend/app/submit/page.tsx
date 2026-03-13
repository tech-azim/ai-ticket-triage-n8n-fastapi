'use client';

import { useState } from 'react';
import {
  Card, Form, Input, Button, Typography, Space, Alert, Steps, Divider
} from 'antd';
import {
  SendOutlined, RobotOutlined, CheckCircleOutlined,
  ThunderboltOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createTicket } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EXAMPLES = [
  {
    title: 'Sistem pembayaran down total',
    description: 'Seluruh transaksi pembayaran gagal sejak 30 menit lalu, ribuan user tidak bisa checkout, kerugian terus bertambah',
    by: 'ops@company.com',
    label: '🔴 Critical (ID)',
  },
  {
    title: 'Payment gateway timeout',
    description: 'Payment gateway keeps timing out for all users, revenue impact is critical, need immediate fix',
    by: 'eng@company.com',
    label: '🔴 Critical (EN)',
  },
  {
    title: 'Tidak bisa login error 500',
    description: 'User melaporkan tidak bisa masuk ke aplikasi, muncul internal server error 500 saat login',
    by: 'support@company.com',
    label: '🟠 High (ID)',
  },
  {
    title: 'Button color slightly off',
    description: 'The primary button in the settings page appears slightly darker than the design spec',
    by: 'design@company.com',
    label: '🟢 Low (EN)',
  },
];

export default function SubmitPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (values: { title: string; description: string; submitted_by: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createTicket(values);
      setSuccess({ id: ticket.id });
      form.resetFields();
    } catch {
      setError('Failed to submit. Is the FastAPI backend running on localhost:8000?');
    } finally {
      setSubmitting(false);
    }
  };

  const fillExample = (ex: typeof EXAMPLES[0]) => {
    form.setFieldsValue({ title: ex.title, description: ex.description, submitted_by: ex.by });
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Back */}
      <Link href="/">
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#6b7280', marginBottom: 20, padding: 0 }}>
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, color: '#e2e8f0' }}>Submit New Ticket</Title>
        <Text style={{ color: '#6b7280', fontSize: 13 }}>
          AI will automatically classify urgency, detect language, and find similar tickets
        </Text>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
        {/* Form */}
        <Card
          style={{ background: '#13162a', border: '1px solid #1f2240', borderRadius: 14 }}
          styles={{ body: { padding: '24px' } }}
        >
          {success && (
            <Alert
              type="success"
              icon={<CheckCircleOutlined />}
              message={
                <span>
                  Ticket <strong style={{ color: '#6366f1' }}>#{success.id}</strong> submitted! AI is analyzing...
                </span>
              }
              action={
                <Space>
                  <Link href={`/tickets/${success.id}`}>
                    <Button size="small" type="primary">View Ticket</Button>
                  </Link>
                  <Link href="/">
                    <Button size="small">Dashboard</Button>
                  </Link>
                </Space>
              }
              style={{ marginBottom: 20, background: '#0f2a1a', border: '1px solid #52c41a44' }}
              closable
              onClose={() => setSuccess(null)}
            />
          )}

          {error && (
            <Alert
              type="error"
              message={error}
              style={{ marginBottom: 20, background: '#2d1515', border: '1px solid #ff4d4f44' }}
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              label={<span style={{ color: '#a0aec0' }}>Ticket Title</span>}
              name="title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input
                placeholder="e.g. Login error 500, Payment gateway down..."
                size="large"
                style={{ background: '#0d0f1a', borderColor: '#2a2d45', color: '#e2e8f0' }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#a0aec0' }}>Description</span>}
              name="description"
              rules={[{ required: true, message: 'Please describe the issue' }]}
            >
              <TextArea
                rows={5}
                placeholder="Describe the issue in detail — in any language (EN, ID, etc.)..."
                style={{ background: '#0d0f1a', borderColor: '#2a2d45', color: '#e2e8f0', resize: 'none' }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#a0aec0' }}>Submitted By (email)</span>}
              name="submitted_by"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input
                placeholder="user@company.com"
                size="large"
                style={{ background: '#0d0f1a', borderColor: '#2a2d45', color: '#e2e8f0' }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SendOutlined />}
              size="large"
              block
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', height: 46 }}
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </Form>
        </Card>

        {/* Examples sidebar */}
        <div>
          <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            Quick Examples
          </Text>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXAMPLES.map((ex, i) => (
              <Card
                key={i}
                hoverable
                onClick={() => fillExample(ex)}
                style={{
                  background: '#1a1d33',
                  border: '1px solid #2a2d45',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
                styles={{ body: { padding: '10px 12px' } }}
              >
                <Text style={{ color: '#8b5cf6', fontSize: 11, display: 'block', marginBottom: 2 }}>
                  {ex.label}
                </Text>
                <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }} ellipsis>
                  {ex.title}
                </Text>
              </Card>
            ))}
          </div>
          <Text style={{ color: '#4a5568', fontSize: 11, marginTop: 10, display: 'block' }}>
            Click to fill form with example data
          </Text>
        </div>
      </div>
    </div>
  );
}