import { Card } from 'antd';

export default function FormSection({ icon, title, children, style }) {
  return (
    <Card
      style={{
        marginBottom: 20,
        borderRadius: 12,
        border: '1px solid #e8e0d0',
        borderLeft: '4px solid #6B1A1A',
        boxShadow: '0 1px 6px rgba(92,26,27,0.06)',
        ...style,
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && (
            <span
              style={{
                color: '#6B1A1A',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(107,26,26,0.08)',
                borderRadius: 8,
                padding: '4px 6px',
              }}
            >
              {icon}
            </span>
          )}
          <span style={{ fontWeight: 600, color: '#2d2d2d', fontSize: 15 }}>{title}</span>
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #f0ebe0', background: '#F9F5EE' } }}
    >
      {children}
    </Card>
  );
}
