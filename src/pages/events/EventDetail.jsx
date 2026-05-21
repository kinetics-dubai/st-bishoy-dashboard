import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Popconfirm, Empty, Badge, Tag, Typography, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchEvent, deleteEvent } from '@/store/eventsSlice';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import CenteredLoader from '@/components/CenteredLoader';

const { Title, Text, Paragraph } = Typography;

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentEvent, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    if (slug) dispatch(fetchEvent(slug));
  }, [dispatch, slug]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteEvent(currentEvent.id)).unwrap();
      message.success(t('events.deleteSuccess'));
      navigate('/events');
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const displayTitle =
    i18n.language === 'ar' && currentEvent?.title_ar
      ? currentEvent.title_ar
      : currentEvent?.title;

  if (loading) return <CenteredLoader minHeight="calc(100vh - 220px)" />;

  if (!currentEvent) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description={error || t('common.notAvailable')} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/events')}>
            {t('common.back')}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <Title level={3} style={{ color: '#6B1A1A', margin: 0 }}>
            {displayTitle || t('common.notAvailable')}
          </Title>
          <Badge
            status={currentEvent.published ? 'success' : 'default'}
            text={currentEvent.published ? t('events.publishedStatus') : t('events.draftStatus')}
          />
          {currentEvent.is_virtual && (
            <Tag color="blue">{t('events.isVirtualLabel')}</Tag>
          )}
        </div>

        {/* Images */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {currentEvent.cover_image && (
            <Col xs={24} md={12}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {t('events.coverImageLabel')}
              </Text>
              <img
                src={resolveMediaUrl(currentEvent.cover_image)}
                alt={displayTitle}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
              />
            </Col>
          )}
          {currentEvent.thumbnail && (
            <Col xs={24} md={12}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {t('events.thumbnailLabel')}
              </Text>
              <img
                src={resolveMediaUrl(currentEvent.thumbnail)}
                alt={displayTitle}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
              />
            </Col>
          )}
        </Row>

        {/* Meta fields */}
        <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
          {currentEvent.slug && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.slugLabel')}: </Text>
              <Text code>{currentEvent.slug}</Text>
            </Col>
          )}
          {currentEvent.start_at && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.startAtLabel')}: </Text>
              <Text>{dayjs(currentEvent.start_at).format('YYYY-MM-DD HH:mm')}</Text>
            </Col>
          )}
          {currentEvent.end_at && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.endAtLabel')}: </Text>
              <Text>{dayjs(currentEvent.end_at).format('YYYY-MM-DD HH:mm')}</Text>
            </Col>
          )}
          {currentEvent.venue && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.venueLabel')}: </Text>
              <Text>{currentEvent.venue}</Text>
            </Col>
          )}
          {currentEvent.venue_ar && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.venueArLabel')}: </Text>
              <Text dir="rtl">{currentEvent.venue_ar}</Text>
            </Col>
          )}
          {currentEvent.online_link && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.onlineLinkLabel')}: </Text>
              <a href={currentEvent.online_link} target="_blank" rel="noopener noreferrer">
                <LinkOutlined /> {currentEvent.online_link}
              </a>
            </Col>
          )}
          {currentEvent.location && (
            <Col xs={24} md={12}>
              <Text type="secondary">{t('events.locationLabel')}: </Text>
              <Text>
                {t('events.latLabel')}: {currentEvent.location.lat},{' '}
                {t('events.lngLabel')}: {currentEvent.location.lng}
              </Text>
            </Col>
          )}
        </Row>

        {/* Excerpts */}
        {currentEvent.excerpt && (
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('events.excerptLabel')}
            </Text>
            <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {currentEvent.excerpt}
              </Paragraph>
            </div>
          </div>
        )}
        {currentEvent.excerpt_ar && (
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('events.excerptArLabel')}
            </Text>
            <div dir="rtl" style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {currentEvent.excerpt_ar}
              </Paragraph>
            </div>
          </div>
        )}

        {/* Content */}
        {currentEvent.content && (
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('events.contentLabel')}
            </Text>
            <div
              style={{ padding: '16px', background: '#fafafa', borderRadius: 8, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentEvent.content }}
            />
          </div>
        )}
        {currentEvent.content_ar && (
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('events.contentArLabel')}
            </Text>
            <div
              dir="rtl"
              style={{ padding: '16px', background: '#fafafa', borderRadius: 8, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentEvent.content_ar }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${slug}/edit`)}
            style={{ background: '#6B1A1A' }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('events.deleteConfirmMessage', { title: displayTitle })}
            onConfirm={handleDelete}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </div>
  );
}
