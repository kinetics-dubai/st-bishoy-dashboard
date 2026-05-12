import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function FormPageLayout({
  title,
  subtitle,
  backPath,
  form,
  saving = false,
  isEditMode = false,
  children,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100vh', background: '#F9F5EE' }}>
      {/* Gradient header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #6B1A1A 0%, #8B2428 60%, #6B1A1A 100%)',
          padding: '20px 28px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.07) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(backPath)}
          style={{
            color: 'rgba(255,255,255,0.8)',
            padding: '0 0 12px',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 500,
          }}
        >
          {t('common.back')}
        </Button>
        <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
          {title}
        </Title>
        {subtitle && (
          <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6, display: 'block', fontSize: 14 }}>
            {subtitle}
          </Text>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px 24px 100px' }}>
        {children}
      </div>

      {/* Sticky bottom save bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 20,
          background: '#F9F5EE',
          borderTop: '1px solid #ede6d8',
          boxShadow: '0 -4px 16px rgba(92, 26, 27, 0.08)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Button
          size="large"
          onClick={() => navigate(backPath)}
          style={{ minWidth: 100 }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={() => form.submit()}
          style={{
            background: '#6B1A1A',
            border: 'none',
            minWidth: 140,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(92,26,27,0.3)',
          }}
        >
          {isEditMode ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </div>
  );
}
