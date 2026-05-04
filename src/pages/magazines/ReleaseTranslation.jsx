import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Form, Image, Input, Modal, Select, Space, Spin, Table, Typography, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, GlobalOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  clearCurrentMagazineReleaseTranslations,
  createMagazineReleaseTranslation,
  deleteMagazineReleaseTranslation,
  fetchMagazineReleaseTranslations,
  fetchLanguages,
  updateMagazineReleaseTranslation,
} from '@/store/translationsSlice';
import apiService from '@/services/apiService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const initialTranslationForm = {
  title: '',
  cover_photo: '',
  file: '',
  language_id: null,
};

const ReleaseTranslation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, releaseYearId, releaseId } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const {
    languages,
    languagesLoading,
    creating,
    updating,
    deleting,
    translationsLoading,
    currentMagazineReleaseTranslations,
  } = useSelector((state) => state.translations);

  const [loading, setLoading] = useState(true);
  const [releaseYearData, setReleaseYearData] = useState(null);
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);

  const loadReleaseYearData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/magazine-release-years/${releaseYearId}`);
      const data = response.data?.data || response.data;
      setReleaseYearData(data || null);
    } catch (error) {
      message.error(t('translations.fetchError'));
      setReleaseYearData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTranslations = async () => {
    if (!releaseId) return;

    try {
      await dispatch(fetchMagazineReleaseTranslations(releaseId)).unwrap();
    } catch (error) {
      message.error(t('translations.fetchError'));
    }
  };

  useEffect(() => {
    if (releaseYearId) {
      loadReleaseYearData();
    }
  }, [releaseYearId]);

  useEffect(() => {
    if (releaseId) {
      loadTranslations();
    }

    return () => {
      dispatch(clearCurrentMagazineReleaseTranslations());
    };
  }, [dispatch, releaseId]);

  useEffect(() => {
    if (!languages?.length) {
      dispatch(fetchLanguages({ limit: 1000 }));
    }
  }, [dispatch, languages]);

  const selectedRelease = useMemo(() => {
    return releaseYearData?.releases?.find((release) => String(release.id) === String(releaseId)) || null;
  }, [releaseYearData, releaseId]);

  const translations = currentMagazineReleaseTranslations || [];

  const getAvailableLanguages = (translation = null) => {
    const usedLanguageIds = translations
      .filter((item) => item?.language_id && item.id !== translation?.id)
      .map((item) => item.language_id);

    return languages.filter((language) => !usedLanguageIds.includes(language.id));
  };

  const openCreateTranslationModal = () => {
    setEditingTranslation(null);
    form.setFieldsValue(initialTranslationForm);
    setIsTranslationModalOpen(true);
  };

  const openEditTranslationModal = async (translation) => {
    try {
      const response = await apiService.get(`/magazine-release-translations/${translation.id}`);
      const translationDetails = response.data?.data || response.data;

      setEditingTranslation(translationDetails);
      form.setFieldsValue({
        title: translationDetails?.title || '',
        cover_photo: translationDetails?.cover_photo || '',
        file: translationDetails?.file || '',
        language_id: translationDetails?.language_id || null,
      });
      setIsTranslationModalOpen(true);
    } catch (error) {
      message.error(t('translations.fetchError'));
    }
  };

  const closeTranslationModal = () => {
    setIsTranslationModalOpen(false);
    setEditingTranslation(null);
    form.resetFields();
  };

  const handleSaveTranslation = async () => {
    if (!selectedRelease?.id) {
      message.error(t('magazines.chooseRelease'));
      return;
    }

    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        magazine_release_id: selectedRelease.id,
      };

      if (editingTranslation?.id) {
        await dispatch(
          updateMagazineReleaseTranslation({
            id: editingTranslation.id,
            data: payload,
          })
        ).unwrap();
        message.success(t('magazines.translationUpdateSuccess'));
      } else {
        await dispatch(createMagazineReleaseTranslation(payload)).unwrap();
        message.success(t('translations.createSuccess'));
      }

      closeTranslationModal();
      loadTranslations();
    } catch (submitError) {
      if (submitError?.errorFields) return;
      message.error(t('translations.fetchError'));
    }
  };

  const handleDeleteTranslation = (translation) => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('translations.deleteConfirmMessage', {
        title: translation.title,
        language: translation.language?.name || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteMagazineReleaseTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
          loadTranslations();
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const translationColumns = [
    {
      title: t('translations.language'),
      dataIndex: ['language', 'name'],
      key: 'language',
      render: (value, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#5C1A1B' }} />
          <Text strong>{value || t('common.notAvailable')}</Text>
          <Text type="secondary">({record?.language?.abbr || 'N/A'})</Text>
        </Space>
      ),
    },
    {
      title: t('translations.translationTitle'),
      dataIndex: 'title',
      key: 'title',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('magazines.coverPhoto'),
      dataIndex: 'cover_photo',
      key: 'cover_photo',
      render: (value, record) => (
        <Image
          width={52}
          height={72}
          src={value}
          alt={record.title}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioaOAjDJiGPjf0aMIjYU85I4TZBwS0pQyIhT4B4HqOIbRkHqJpEqNJ8AAY+FkXQxAAAAAElFTkSuQmCC"
        />
      ),
    },
    {
      title: t('magazines.translationFile'),
      dataIndex: 'file',
      key: 'file',
      render: (value) => value ? (
        <a href={value} target="_blank" rel="noreferrer">{t('magazines.openFile')}</a>
      ) : (
        t('common.notAvailable')
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditTranslationModal(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteTranslation(record)} loading={deleting} />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!releaseYearData || !selectedRelease) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('magazines.notFound')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => navigate(`/magazines/${id}/release-years/${releaseYearId}`)}>
              {t('common.back')}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/magazines/${id}/release-years/${releaseYearId}`)}>
              {t('common.back')}
            </Button>
            <div>
              <Title level={4} style={{ margin: 0 }}>{t('magazines.releaseTranslations')}</Title>
              <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                {selectedRelease.issue_label || selectedRelease.title}
              </Paragraph>
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateTranslationModal}
            disabled={getAvailableLanguages().length === 0}
          >
            {t('translations.addTranslation')}
          </Button>
        </div>

        <Table
          columns={translationColumns}
          dataSource={translations}
          loading={translationsLoading}
          rowKey="id"
          locale={{ emptyText: t('translations.noTranslations') }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingTranslation ? t('magazines.editTranslation') : t('translations.createTranslation')}
        open={isTranslationModalOpen}
        onOk={handleSaveTranslation}
        onCancel={closeTranslationModal}
        confirmLoading={creating || updating}
        okText={editingTranslation ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" initialValues={initialTranslationForm}>
          <Form.Item
            name="language_id"
            label={t('translations.language')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select
              placeholder={t('translations.selectLanguage')}
              loading={languagesLoading}
              disabled={!getAvailableLanguages(editingTranslation).length}
            >
              {getAvailableLanguages(editingTranslation).map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name} ({language.abbr})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label={t('translations.translationTitle')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('translations.titlePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="cover_photo"
            label={t('magazines.coverPhotoUrl')}
            rules={[
              { required: true, message: t('validation.required') },
              { type: 'url', message: t('validation.url') },
            ]}
          >
            <Input placeholder="https://example.com/translation-cover.jpg" />
          </Form.Item>

          <Form.Item
            name="file"
            label={t('magazines.translationFile')}
            rules={[
              { required: true, message: t('validation.required') },
              { type: 'url', message: t('validation.url') },
            ]}
          >
            <Input placeholder="https://example.com/release-translation.pdf" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReleaseTranslation;
