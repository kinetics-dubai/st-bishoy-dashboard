import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  HomeOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { clearCurrentEntity, deleteEntity, fetchEntity } from '@/store/entitiesSlice';
import {
  clearCurrentEntityTranslations,
  deleteEntityTranslation,
  fetchEntityTranslations,
  fetchLanguages,
} from '@/store/translationsSlice';

const { Title, Text } = Typography;

const EntityDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { t } = useTranslation();

  const { currentEntity, loading, deleting: deletingEntity } = useSelector((state) => state.entities);
  const { languages, currentEntityTranslations, translationsLoading, deleting } = useSelector((state) => state.translations);

  useEffect(() => {
    if (slug) {
      dispatch(fetchEntity(slug));
    }

    if (!languages?.length) {
      dispatch(fetchLanguages({ limit: 1000 }));
    }

    return () => {
      dispatch(clearCurrentEntity());
      dispatch(clearCurrentEntityTranslations());
    };
  }, [dispatch, languages?.length, slug]);

  useEffect(() => {
    if (currentEntity?.id) {
      dispatch(fetchEntityTranslations(currentEntity.id));
    }
  }, [currentEntity?.id, dispatch]);

  const translations = useMemo(() => currentEntityTranslations || [], [currentEntityTranslations]);
  const usedLanguageIds = useMemo(
    () => translations.filter((item) => item?.language_id).map((item) => item.language_id),
    [translations]
  );
  const availableLanguageCount = useMemo(
    () => (languages || []).filter((language) => !usedLanguageIds.includes(language.id)).length,
    [languages, usedLanguageIds]
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'diocese':
        return 'purple';
      case 'monastery':
        return 'gold';
      case 'organization':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const handleDeleteTranslation = (translation) => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('translations.deleteConfirmMessage', {
        title: translation?.name || t('common.notAvailable'),
        language: translation?.language?.name || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteEntityTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
          dispatch(fetchEntityTranslations(currentEntity.id));
        } catch (submitError) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const handleDeleteEntity = () => {
    Modal.confirm({
      title: t('entities.deleteConfirm'),
      content: t('entities.deleteConfirmMessage', {
        name: currentEntity?.name || currentEntity?.slug || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteEntity(currentEntity.id)).unwrap();
          message.success(t('entities.deleteSuccess'));
          navigate('/entities');
        } catch (submitError) {
          message.error(t('entities.deleteError'));
        }
      },
    });
  };

  const columns = [
    {
      title: t('translations.language'),
      key: 'language',
      render: (_, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#5C1A1B' }} />
          <Text strong>{record?.language?.name || t('common.notAvailable')}</Text>
          <Text type="secondary">({record?.language?.abbr || 'N/A'})</Text>
        </Space>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/entities/${slug}/translations/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/entities/${slug}/translations/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleting}
            onClick={() => handleDeleteTranslation(record)}
          />
        </Space>
      ),
    },
  ];

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
          <Empty description={t('entities.notFound')} />
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
              <div>
                <Space align="center" style={{ marginBottom: '12px' }}>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/entities')}>
                    {t('common.back')}
                  </Button>
                  <Title level={2} style={{ margin: 0 }}>
                    {currentEntity.name || currentEntity.slug || t('entities.title')}
                  </Title>
                </Space>
              </div>
            </Space>

            <Space>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/entities/${slug}/edit`)}>
                {t('common.edit')}
              </Button>
              <Button danger icon={<DeleteOutlined />} loading={deletingEntity} onClick={handleDeleteEntity}>
                {t('common.delete')}
              </Button>
            </Space>
          </div>
        </Card>

        <Card title={t('entities.details')}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t('entities.name')}>
              {currentEntity.name || t('common.notAvailable')}
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.slug')}>
              {currentEntity.slug || t('common.notAvailable')}
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.category')}>
              {t(`entities.${currentEntity.category}`)}
            </Descriptions.Item>
            <Descriptions.Item label={t('entities.tags')}>
              {currentEntity.tags?.length ? (
                <Space size={[0, 8]} wrap>
                  {currentEntity.tags.map((tag) => (
                    <Tag color="green" key={tag.id}>
                      {tag.name || tag.slug}
                    </Tag>
                  ))}
                </Space>
              ) : (
                t('entities.noTags')
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={t('translations.title')}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/entities/${slug}/translations/create`)}
              disabled={availableLanguageCount === 0}
            >
              {t('translations.addTranslation')}
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={translations}
            rowKey={(record) => record.id}
            loading={translationsLoading}
            pagination={false}
            locale={{ emptyText: t('translations.noTranslations') }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default EntityDetail;
