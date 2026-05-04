import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Space, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  clearCurrentEntity,
  fetchEntity,
} from '@/store/entitiesSlice';
import {
  clearCurrentEntityTranslations,
  fetchEntityTranslations,
  fetchLanguages,
} from '@/store/translationsSlice';
import EntityTranslationContent from '@/components/EntityTranslationContent';
import { getSummaryContent } from '@/pages/entities/entityHelpers';

const { Title, Text } = Typography;

const EntityTranslationDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug, translationId } = useParams();
  const { t } = useTranslation();

  const { currentEntity, loading } = useSelector((state) => state.entities);
  const { languages, currentEntityTranslations, translationsLoading } = useSelector((state) => state.translations);

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

  const currentTranslation = useMemo(
    () => (currentEntityTranslations || []).find((item) => String(item.id) === String(translationId)) || null,
    [currentEntityTranslations, translationId]
  );

  if ((loading && !currentEntity) || (translationsLoading && !currentTranslation)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentEntity || !currentTranslation) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('translations.noTranslations')} />
        </Card>
      </div>
    );
  }

  const summaryContent = getSummaryContent(currentTranslation.dynamic_data);

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Space align="center" size={16} wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/entities/${slug}`)}>
                {t('common.back')}
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                {currentTranslation.name || t('entities.translationName')}
              </Title>
            </Space>

            <Space size={12} wrap align="center">
              <Tag color="blue" style={{ margin: 0, paddingInline: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <GlobalOutlined />
                {currentTranslation.language?.name || t('common.notAvailable')}
              </Tag>
              <Text type="secondary">{currentTranslation.language?.abbr || 'N/A'}</Text>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/entities/${slug}/translations/${translationId}/edit`)}>
                {t('common.edit')}
              </Button>
            </Space>
          </div>
        </Card>

        <Card title={t('entities.translationName')}>
          <Text>{currentTranslation.name || t('common.notAvailable')}</Text>
        </Card>

        <Card title={t('entities.summary')}>
          {summaryContent ? (
            <EntityTranslationContent title={t('entities.summary')} content={summaryContent} collapsible={false} />
          ) : (
            <Text type="secondary">{t('common.notAvailable')}</Text>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default EntityTranslationDetail;
