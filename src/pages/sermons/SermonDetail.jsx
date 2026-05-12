import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Popconfirm, Empty, Descriptions, Typography, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchSermon, deleteSermon } from '@/store/sermonsSlice';
import CenteredLoader from '@/components/CenteredLoader';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function SermonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentSermon, loading, error } = useSelector((state) => state.sermons);

  useEffect(() => {
    if (id) dispatch(fetchSermon(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteSermon(id)).unwrap();
      message.success(t('sermons.deleteSuccess'));
      navigate('/sermons');
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const displayTitle =
    i18n.language === 'ar' && currentSermon?.title_ar
      ? currentSermon.title_ar
      : currentSermon?.title;

  if (loading) return <CenteredLoader minHeight="calc(100vh - 220px)" />;

  if (!currentSermon) {
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
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/sermons')}>
            {t('common.back')}
          </Button>
        </div>

        <Title level={3} style={{ color: '#6B1A1A', marginBottom: 16 }}>
          {displayTitle || t('common.notAvailable')}
        </Title>

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label={t('sermons.title')}>
            {currentSermon.title || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('sermons.title_ar')}>
            {currentSermon.title_ar || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('sermons.date')}>
            {currentSermon.date
              ? dayjs(currentSermon.date).format('YYYY-MM-DD')
              : t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('sermons.video_url')}>
            {currentSermon.video_url ? (
              <a href={currentSermon.video_url} target="_blank" rel="noopener noreferrer">
                {currentSermon.video_url}
              </a>
            ) : (
              t('common.notAvailable')
            )}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/sermons/${id}/edit`)}
            style={{ background: '#6B1A1A' }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('sermons.deleteConfirm', { title: displayTitle })}
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
