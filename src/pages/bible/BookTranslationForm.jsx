import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { ArrowLeftOutlined, GlobalOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '@/components/CenteredLoader';
import {
  clearBookTranslations,
  clearCurrentBookTranslation,
  createBookTranslation,
  fetchBookTranslation,
  fetchBookTranslations,
  updateBookTranslation,
} from '@/store/booksSlice';
import { fetchLanguages } from '@/store/translationsSlice';

const { Option } = Select;

const BookTranslationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, translationId } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = Boolean(translationId);

  const {
    bookTranslations,
    currentBookTranslation,
    bookTranslationsLoading,
    creatingBookTranslation,
    updatingBookTranslation,
  } = useSelector((state) => state.books);
  const { languages, languagesLoading } = useSelector((state) => state.translations);
  const languagesCount = languages?.length || 0;

  useEffect(() => {
    if (!languagesCount) {
      dispatch(fetchLanguages({ limit: 1000 }));
    }

    dispatch(fetchBookTranslations(id));

    if (isEditing) {
      form.resetFields();
      dispatch(clearCurrentBookTranslation());
      dispatch(fetchBookTranslation(translationId));
    }

    return () => {
      dispatch(clearBookTranslations());
      dispatch(clearCurrentBookTranslation());
    };
  }, [dispatch, form, id, isEditing, languagesCount, translationId]);

  useEffect(() => {
    if (isEditing && currentBookTranslation && String(currentBookTranslation.id) === String(translationId)) {
      form.setFieldsValue({
        title: currentBookTranslation.title,
        language_id: currentBookTranslation.language_id,
      });
    }
  }, [currentBookTranslation, form, isEditing, translationId]);

  const usedLanguageIds = useMemo(
    () => (bookTranslations || [])
      .filter((item) => item?.language_id && String(item.id) !== String(translationId))
      .map((item) => item.language_id),
    [bookTranslations, translationId]
  );

  const availableLanguages = useMemo(
    () => (languages || []).filter((language) => !usedLanguageIds.includes(language.id)),
    [languages, usedLanguageIds]
  );

  const languageOptions = isEditing
    ? (languages || [])
    : availableLanguages;

  const isReadyForEdit = !isEditing || String(currentBookTranslation?.id) === String(translationId);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        book_id: Number(id),
      };

      if (isEditing) {
        await dispatch(updateBookTranslation({ id: translationId, data: payload })).unwrap();
        message.success(t('translations.updateSuccess'));
      } else {
        await dispatch(createBookTranslation(payload)).unwrap();
        message.success(t('translations.createSuccess'));
      }

      navigate(`/bible/books/${id}/translations`);
    } catch (error) {
      message.error(isEditing ? t('translations.updateError') : t('translations.createError'));
    }
  };

  if (isEditing && (bookTranslationsLoading || !isReadyForEdit)) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <CenteredLoader minHeight="calc(100vh - 260px)" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GlobalOutlined style={{ color: '#5C1A1B' }} />
            <h2 style={{ margin: 0 }}>
              {isEditing ? t('bible.editBookTranslation') : t('bible.createBookTranslation')}
            </h2>
          </div>

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/bible/books/${id}/translations`)}
          >
            {t('common.back')}
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: '600px' }}>
          <Form.Item
            label={t('translations.translationTitle')}
            name="title"
            rules={[{ required: true, message: t('bible.titleRequired') }]}
          >
            <Input placeholder={t('translations.titlePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('translations.language')}
            name="language_id"
            rules={[{ required: true, message: t('translations.selectLanguage') }]}
          >
            <Select
              placeholder={languagesLoading ? t('common.loading') : t('translations.selectLanguage')}
              loading={languagesLoading}
            >
              {languageOptions.map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name} {language.abbr ? `(${language.abbr})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={creatingBookTranslation || updatingBookTranslation}
                style={{ background: '#5C1A1B', border: 'none' }}
              >
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button type="default" onClick={() => navigate(`/bible/books/${id}/translations`)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BookTranslationForm;
