import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Space, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined, GlobalOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '@/components/RichTextEditor';
import { clearCurrentEntity, fetchEntity } from '@/store/entitiesSlice';
import {
  clearCurrentEntityTranslations,
  createEntityTranslation,
  fetchEntityTranslations,
  fetchLanguages,
  updateEntityTranslation,
} from '@/store/translationsSlice';
import { buildDynamicDataPayload, getSummaryContent } from '@/pages/entities/entityHelpers';

const { Title } = Typography;
const { Option } = Select;

const EntityTranslationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug, translationId } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = Boolean(translationId);
  const { currentEntity, loading } = useSelector((state) => state.entities);
  const { languages, languagesLoading, currentEntityTranslations, creating, updating } = useSelector((state) => state.translations);
  const [summary, setSummary] = useState('');

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

  const usedLanguageIds = useMemo(
    () =>
      (currentEntityTranslations || [])
        .filter((item) => item?.language_id && String(item.id) !== String(translationId))
        .map((item) => item.language_id),
    [currentEntityTranslations, translationId]
  );

  const availableLanguages = useMemo(
    () => (languages || []).filter((language) => !usedLanguageIds.includes(language.id)),
    [languages, usedLanguageIds]
  );

  useEffect(() => {
    if (!currentEntity?.name) return;

    if (isEditing && currentTranslation) {
      form.setFieldsValue({
        name: currentTranslation.name || '',
        language_id: currentTranslation.language_id ?? null,
      });
      setSummary(getSummaryContent(currentTranslation.dynamic_data));
      return;
    }

    if (!isEditing && availableLanguages.length) {
      form.setFieldsValue({
        name: currentEntity.name,
        language_id: form.getFieldValue('language_id') || availableLanguages[0].id,
      });
    }
  }, [availableLanguages, currentEntity?.name, currentTranslation, form, isEditing]);

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        const patchData = {};
        const nextSummary = buildDynamicDataPayload(summary);
        const currentSummary = currentTranslation?.dynamic_data ?? null;

        if (values.name !== (currentTranslation?.name || '')) {
          patchData.name = values.name;
        }

        if (JSON.stringify(nextSummary) !== JSON.stringify(currentSummary)) {
          patchData.dynamic_data = nextSummary;
        }

        if (!Object.keys(patchData).length) {
          message.info(t('common.noChanges'));
          navigate(`/entities/${slug}/translations/${currentTranslation.id}`);
          return;
        }

        await dispatch(
          updateEntityTranslation({
            id: currentTranslation.id,
            data: patchData,
          })
        ).unwrap();

        message.success(t('translations.updateSuccess'));
        navigate(`/entities/${slug}/translations/${currentTranslation.id}`);
        return;
      }

      await dispatch(
        createEntityTranslation({
          name: values.name,
          language_id: values.language_id,
          entity_id: currentEntity.id,
          dynamic_data: buildDynamicDataPayload(summary),
        })
      ).unwrap();

      message.success(t('translations.createSuccess'));
      navigate(`/entities/${slug}`);
    } catch (submitError) {
      if (submitError?.errorFields) return;
      message.error(isEditing ? t('translations.updateError') : t('translations.createError'));
    }
  };

  if ((loading && !currentEntity) || (isEditing && !currentTranslation && !currentEntityTranslations.length)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(isEditing ? `/entities/${slug}/translations/${translationId}` : `/entities/${slug}`)}
          >
            {t('common.back')}
          </Button>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GlobalOutlined style={{ color: '#5C1A1B' }} />
            {isEditing ? t('translations.editTranslation') : t('translations.addTranslation')}
          </Title>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: '780px' }}>
          <Form.Item
            name="name"
            label={t('entities.translationName')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('entities.translationNamePlaceholder')} size="large" />
          </Form.Item>

          <Form.Item
            name="language_id"
            label={t('translations.language')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select
              placeholder={t('translations.selectLanguage')}
              size="large"
              loading={languagesLoading}
              disabled={isEditing || !availableLanguages.length}
            >
              {(isEditing ? languages : availableLanguages).map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name} ({language.abbr})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t('entities.summary')}>
            <RichTextEditor
              value={summary}
              onChange={setSummary}
              placeholder={t('entities.summaryPlaceholder')}
            />
          </Form.Item>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={creating || updating}
                size="large"
              >
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button
                onClick={() => navigate(isEditing ? `/entities/${slug}/translations/${translationId}` : `/entities/${slug}`)}
                size="large"
              >
                {t('common.cancel')}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EntityTranslationForm;
