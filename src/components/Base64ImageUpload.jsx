import { Button, Image, Progress, Space, Typography, Upload, message } from 'antd';
import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const { Text } = Typography;

function fileToBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const pct = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
      onProgress?.(pct);
    };
    reader.onerror = reject;
  });
}

export default function Base64ImageUpload({
  value,
  onChange,
  buttonLabel,
  emptyLabel,
  removeLabel,
  errorLabel,
  accept = 'image/*',
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [readingPct, setReadingPct] = useState(0);
  const [reading, setReading] = useState(false);

  const handleBeforeUpload = async (file) => {
    try {
      setReading(true);
      setReadingPct(0);
      const base64 = await fileToBase64(file, setReadingPct);
      onChange?.(base64);
    } catch {
      message.error(errorLabel);
    } finally {
      setReading(false);
    }

    return false;
  };

  const hasValue = typeof value === 'string' && value.length > 0;
  const resolvedValue = hasValue ? resolveMediaUrl(value) : '';

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 12,
        border: '1px solid rgba(107,26,26,0.12)',
        background: '#F9F5EE',
        padding: 12,
      }}
    >
      {hasValue && (
        <Image
          src={resolvedValue}
          alt="preview"
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            border: '1px solid rgba(107,26,26,0.12)',
            background: 'rgba(107,26,26,0.05)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            cursor: hasValue ? 'pointer' : 'default',
          }}
          role={hasValue ? 'button' : undefined}
          tabIndex={hasValue ? 0 : undefined}
          onClick={() => {
            if (hasValue) setPreviewOpen(true);
          }}
          onKeyDown={(e) => {
            if (!hasValue) return;
            if (e.key === 'Enter' || e.key === ' ') setPreviewOpen(true);
          }}
        >
          {hasValue ? (
            <img
              src={resolvedValue}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <PictureOutlined style={{ color: 'rgba(107,26,26,0.7)', fontSize: 18 }} />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Text style={{ color: 'rgba(107,26,26,0.88)' }}>
            {hasValue ? buttonLabel : emptyLabel}
          </Text>
        </div>

        <Space size={6} style={{ flex: '0 0 auto' }}>
          <Upload
            accept={accept}
            maxCount={1}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <Button icon={<UploadOutlined />}>{buttonLabel}</Button>
          </Upload>
          {hasValue && (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange?.('');
              }}
            >
              {removeLabel}
            </Button>
          )}
        </Space>
      </div>
      {reading ? (
        <div style={{ marginTop: 10 }}>
          <Progress
            percent={readingPct || 0}
            showInfo={false}
            strokeColor="#6B1A1A"
            trailColor="rgba(107,26,26,0.08)"
            size="small"
          />
        </div>
      ) : null}
    </div>
  );
}
