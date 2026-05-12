import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Modal, Space, Spin, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { clearCurrentTag, deleteTag, fetchTag } from '@/store/tagsSlice';
import { getApiErrorMessage } from '@/lib/apiError';

const { Title, Text } = Typography;

const TagDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { currentTag, loading, deleting } = useSelector((state) => state.tags);

  useEffect(() => {
    if (id) {
      dispatch(fetchTag(id));
    }

    return () => {
      dispatch(clearCurrentTag());
    };
  }, [dispatch, id]);

  const currentTranslation = currentTag?.translation || {};
  const baseTag = currentTag?.base || currentTag || {};

  const getCategoryColor = (category) => {
    switch (category) {
      case 'article':
        return 'blue';
      case 'entity':
        return 'green';
      default:
        return 'default';
    }
  };

  const handleDeleteTag = () => {
    Modal.confirm({
      title: t('tags.deleteConfirm'),
      content: t('tags.deleteConfirmMessage', {
        name: currentTag?.name || currentTag?.slug || t('common.notAvailable'),
        category: currentTag?.category || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteTag(id)).unwrap();
          message.success(t('tags.deleteSuccess'));
          navigate('/tags');
        } catch (error) {
          message.error(getApiErrorMessage(error, t('tags.deleteError')));
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentTag) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('tags.fetchError')} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <Space align="center" style={{ marginBottom: '16px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tags')}>
                  {t('common.back')}
                </Button>
                <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TagOutlined style={{ color: '#6B1A1A' }} />
                  {currentTranslation?.name || baseTag?.slug || t('tags.title')}
                </Title>
              </Space>

              <Space wrap size={[8, 8]}>
                <Tag color={getCategoryColor(baseTag?.category)}>{baseTag?.category || t('common.notAvailable')}</Tag>
                <Text type="secondary">{baseTag?.slug || t('common.notAvailable')}</Text>
              </Space>
            </div>
          </div>
        </Card>

        <Card title={t('tags.details')}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">{t('tags.name')}</Text>
              <div>{currentTranslation?.name || baseTag?.name || t('common.notAvailable')}</div>
            </div>
            <div>
              <Text type="secondary">{t('tags.slug')}</Text>
              <div>{baseTag?.slug || t('common.notAvailable')}</div>
            </div>
            <div>
              <Text type="secondary">{t('tags.category')}</Text>
              <div>{baseTag?.category || t('common.notAvailable')}</div>
            </div>
            <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={handleDeleteTag}>
              {t('common.delete')}
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default TagDetail;
