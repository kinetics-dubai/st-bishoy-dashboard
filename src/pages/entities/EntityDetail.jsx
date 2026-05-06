import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Image,
  List,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { clearCurrentEntity, deleteEntity, fetchEntities, fetchEntity } from '@/store/entitiesSlice';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const { Title, Paragraph, Text } = Typography;

function EntityImage({ src, alt, emptyText }) {
  if (!src) {
    return <Text type="secondary">{emptyText}</Text>;
  }

  return (
    <Image
      src={resolveMediaUrl(src)}
      alt={alt}
      style={{ width: '100%', maxWidth: 420, maxHeight: 280, objectFit: 'cover', borderRadius: 12 }}
      fallback=""
    />
  );
}

export default function EntityDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { currentEntity, entities, loading, deleting, error } = useSelector((state) => state.entities);

  useEffect(() => {
    if (id) {
      dispatch(fetchEntity(id));
    }

    return () => {
      dispatch(clearCurrentEntity());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentEntity?.parentId || currentEntity.parent || entities.length > 0) return;
    dispatch(fetchEntities({ page: 1, limit: 1000 }));
  }, [currentEntity, dispatch, entities.length]);

  const displayName =
    i18n.language === 'ar' && currentEntity?.name_ar ? currentEntity.name_ar : currentEntity?.name;
  const resolvedParent =
    currentEntity?.parent ||
    entities.find((entity) => String(entity.id) === String(currentEntity?.parentId)) ||
    null;

  const handleDeleteEntity = () => {
    Modal.confirm({
      title: t('entities.deleteConfirm'),
      content: t('entities.deleteConfirmMessage', {
        name: displayName || currentEntity?.name || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        message.info(t('entities.deleteCascadeNotice'));
        try {
          await dispatch(deleteEntity(currentEntity.id)).unwrap();
          message.success(t('entities.deleteSuccess'));
          navigate('/entities');
        } catch {
          message.error(t('entities.deleteError'));
        }
      },
    });
  };

  const childItems = currentEntity?.children || [];

  if (loading && !currentEntity) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentEntity) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={error || t('entities.notFound')} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <Space align="start" size={16}>
              <EntityImage src={currentEntity.thumbnail || currentEntity.cover_image} alt={displayName} emptyText={t('entities.noImage')} />
              <div>
                <Space align="center" style={{ marginBottom: '12px' }}>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/entities')}>
                    {t('common.back')}
                  </Button>
                  <Title level={2} style={{ margin: 0 }}>
                    {displayName || t('entities.title')}
                  </Title>
                </Space>
                <Space wrap>
                  <Tag color={currentEntity.hasDetails ? 'success' : 'default'}>
                    {t('entities.hasDetails')}: {currentEntity.hasDetails ? t('common.yes') : t('common.no')}
                  </Tag>
                  {resolvedParent ? (
                    <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/entities/${resolvedParent.id}`)}>
                      {t('entities.parent')}: {i18n.language === 'ar' && resolvedParent.name_ar ? resolvedParent.name_ar : resolvedParent.name}
                    </Button>
                  ) : (
                    <Text type="secondary">{t('entities.noParent')}</Text>
                  )}
                </Space>
              </div>
            </Space>

            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/entities/create?parentId=${currentEntity.id}`)}
              >
                {t('entities.addChild')}
              </Button>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/entities/${id}/edit`)}>
                {t('common.edit')}
              </Button>
              <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={handleDeleteEntity}>
                {t('common.delete')}
              </Button>
            </Space>
          </div>
        </Card>

        <Card title={t('entities.summary')}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t('entities.name')}>
              {currentEntity.name || t('common.notAvailable')}
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.nameAr')}>
              {currentEntity.name_ar || t('common.notAvailable')}
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.excerpt')}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {currentEntity.excerpt || t('common.notAvailable')}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.excerptAr')}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {currentEntity.excerpt_ar || t('common.notAvailable')}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.thumbnail')}>
              <EntityImage src={currentEntity.thumbnail} alt={displayName} emptyText={t('entities.noImage')} />
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.coverImage')}>
              <EntityImage src={currentEntity.cover_image} alt={displayName} emptyText={t('entities.noImage')} />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={t('entities.relationships')}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>{t('entities.parent')}</Text>
              <div style={{ marginTop: 8 }}>
                {resolvedParent ? (
                  <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/entities/${resolvedParent.id}`)}>
                    {i18n.language === 'ar' && resolvedParent.name_ar ? resolvedParent.name_ar : resolvedParent.name}
                  </Button>
                ) : (
                  <Text type="secondary">{t('entities.noParent')}</Text>
                )}
              </div>
            </div>

            <div>
              <Text strong>{t('entities.children')}</Text>
              <List
                style={{ marginTop: 8 }}
                dataSource={childItems}
                locale={{ emptyText: t('entities.noChildren') }}
                renderItem={(child) => (
                  <List.Item>
                    <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/entities/${child.id}`)}>
                      {i18n.language === 'ar' && child.name_ar ? child.name_ar : child.name}
                    </Button>
                  </List.Item>
                )}
              />
            </div>
          </Space>
        </Card>

        <Card title={t('entities.overviewSection')}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t('entities.overviewDescription')}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {currentEntity.overview_description || t('common.notAvailable')}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.overviewDescriptionAr')}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {currentEntity.overview_description_ar || t('common.notAvailable')}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.overviewImage')}>
              <EntityImage src={currentEntity.overview_image} alt={displayName} emptyText={t('entities.noImage')} />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {currentEntity.hasDetails ? (
          <>
            <Card title={t('entities.historySection')}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label={t('entities.entityHistory')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_history || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityHistoryAr')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_history_ar || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityHistoryImage')}>
                  <EntityImage src={currentEntity.entity_history_image} alt={displayName} emptyText={t('entities.noImage')} />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title={t('entities.descriptionSection')}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label={t('entities.entityDescription')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_description || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityDescriptionAr')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_description_ar || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityDescriptionImage')}>
                  <EntityImage src={currentEntity.entity_description_image} alt={displayName} emptyText={t('entities.noImage')} />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title={t('entities.locationSection')}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label={t('entities.entityLocationDescription')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_location_description || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityLocationDescriptionAr')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_location_description_ar || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title={t('entities.landmarksSection')}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label={t('entities.entityLandmarksDescription')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_landmarks_description || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityLandmarksDescriptionAr')}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {currentEntity.entity_landmarks_description_ar || t('common.notAvailable')}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('entities.entityLandmarksImage')}>
                  <EntityImage src={currentEntity.entity_landmarks_image} alt={displayName} emptyText={t('entities.noImage')} />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        ) : null}
      </Space>
    </div>
  );
}
