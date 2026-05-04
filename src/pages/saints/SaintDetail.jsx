import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Select,
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
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  clearCurrentSaint,
  clearCurrentSaintTranslations,
  createSaintTranslation,
  deleteSaint,
  deleteSaintTranslation,
  fetchSaint,
  fetchSaintTranslations,
  updateSaintTranslation,
} from '@/store/saintsSlice';
import { fetchLanguages } from '@/store/translationsSlice';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const SaintDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const {
    currentSaint,
    currentSaintTranslations,
    loading,
    deleting,
    translationsLoading,
    creatingTranslation,
    updatingTranslation,
    deletingTranslation,
  } = useSelector((state) => state.saints);
  const { languages, languagesLoading } = useSelector((state) => state.translations);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchSaint(id));
      dispatch(fetchSaintTranslations(id));
    }

    if (!languages?.length) {
      dispatch(fetchLanguages({ limit: 1000 }));
    }

    return () => {
      dispatch(clearCurrentSaint());
      dispatch(clearCurrentSaintTranslations());
    };
  }, [dispatch, id, languages?.length]);

  const usedLanguageIds = useMemo(
    () =>
      (currentSaintTranslations || [])
        .filter((item) => item?.language_id && item.id !== editingTranslation?.id)
        .map((item) => item.language_id),
    [currentSaintTranslations, editingTranslation?.id]
  );

  const availableLanguages = useMemo(
    () => (languages || []).filter((language) => !usedLanguageIds.includes(language.id)),
    [languages, usedLanguageIds]
  );

  const openCreateModal = () => {
    if (!availableLanguages.length) {
      message.warning(t('translations.noAvailableLanguages'));
      return;
    }

    setEditingTranslation(null);
    form.setFieldsValue({
      language_id: availableLanguages[0]?.id ?? null,
      name: '',
      subtitle: '',
      biography: '',
      excerpt: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (translation) => {
    setEditingTranslation(translation);
    form.setFieldsValue({
      language_id: translation?.language_id ?? null,
      name: translation?.name || '',
      subtitle: translation?.subtitle || '',
      biography: translation?.biography || '',
      excerpt: translation?.excerpt || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTranslation(null);
    form.resetFields();
  };

  const handleSaveTranslation = async () => {
    try {
      const values = await form.validateFields();

      if (editingTranslation) {
        await dispatch(
          updateSaintTranslation({
            id: editingTranslation.id,
            data: {
              name: values.name,
              subtitle: values.subtitle || null,
              biography: values.biography || null,
              excerpt: values.excerpt || null,
            },
          })
        ).unwrap();
        message.success(t('translations.updateSuccess'));
      } else {
        await dispatch(
          createSaintTranslation({
            name: values.name,
            subtitle: values.subtitle || null,
            biography: values.biography || null,
            excerpt: values.excerpt || null,
            language_id: values.language_id,
            saint_id: Number(id),
          })
        ).unwrap();
        message.success(t('translations.createSuccess'));
      }

      closeModal();
      dispatch(fetchSaintTranslations(id));
    } catch (error) {
      if (error?.errorFields) return;
      message.error(editingTranslation ? t('translations.updateError') : t('translations.createError'));
    }
  };

  const handleDeleteSaint = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('saints.deleteConfirm', {
        name: currentSaint?.name || currentSaint?.slug || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteSaint(id)).unwrap();
          message.success(t('saints.deleteSuccess'));
          navigate('/saints');
        } catch (error) {
          message.error(t('saints.deleteError'));
        }
      },
    });
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
          await dispatch(deleteSaintTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
          dispatch(fetchSaintTranslations(id));
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const translationColumns = [
    {
      title: t('translations.language'),
      key: 'language',
      render: (_, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#5C1A1B' }} />
          <Text strong>{record?.language?.name || t('common.notAvailable')}</Text>
          <Text type="secondary">{record?.language?.abbr || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: t('saints.name'),
      dataIndex: 'name',
      key: 'name',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            title={t('common.edit')}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title={t('common.delete')}
            loading={deletingTranslation}
            onClick={() => handleDeleteTranslation(record)}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentSaint) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('saints.notFound')} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <Space align="center" style={{ marginBottom: '16px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/saints')}>
                  {t('common.back')}
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  {currentSaint?.name || t('saints.title')}
                </Title>
              </Space>

              <Space wrap size={[8, 8]} style={{ marginBottom: '16px' }}>
                <Tag color={currentSaint?.isActive ? 'success' : 'default'}>
                  {currentSaint?.isActive ? t('common.active') : t('common.inactive')}
                </Tag>
              </Space>

              {currentSaint?.subtitle ? (
                <Paragraph type="secondary" style={{ marginBottom: '12px' }}>
                  {currentSaint.subtitle}
                </Paragraph>
              ) : null}

              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t('saints.slug')}>
                  {currentSaint?.slug || t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('saints.saintDay')}>
                  {currentSaint?.saint_day || t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('saints.publishedAt')}>
                  {currentSaint?.publishedAt
                    ? new Date(currentSaint.publishedAt).toLocaleString()
                    : t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('saints.excerpt')}>
                  {currentSaint?.excerpt || t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('saints.biography')}>
                  {currentSaint?.biography || t('common.notAvailable')}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Space>
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/saints/${id}/edit`)}>
                {t('common.edit')}
              </Button>
              <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={handleDeleteSaint}>
                {t('common.delete')}
              </Button>
            </Space>
          </div>
        </Card>

        <Card
          title={t('translations.title')}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('translations.addTranslation')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            loading={translationsLoading}
            columns={translationColumns}
            dataSource={currentSaintTranslations}
            pagination={false}
            locale={{ emptyText: t('translations.noTranslations') }}
          />
        </Card>
      </Space>

      <Modal
        open={isModalOpen}
        title={editingTranslation ? t('translations.editTranslation') : t('translations.createTranslation')}
        onCancel={closeModal}
        onOk={handleSaveTranslation}
        confirmLoading={creatingTranslation || updatingTranslation}
        okText={editingTranslation ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="language_id"
            label={t('translations.language')}
            rules={[{ required: true, message: t('translations.selectLanguage') }]}
          >
            <Select
              disabled={Boolean(editingTranslation)}
              loading={languagesLoading}
              placeholder={t('translations.selectLanguage')}
            >
              {(editingTranslation ? languages : availableLanguages).map((language) => (
                <Select.Option key={language.id} value={language.id}>
                  {language.name} ({language.abbr})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={t('saints.name')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('saints.namePlaceholder')} />
          </Form.Item>

          <Form.Item name="subtitle" label={t('saints.subtitle')}>
            <Input placeholder={t('saints.subtitlePlaceholder')} />
          </Form.Item>

          <Form.Item name="excerpt" label={t('saints.excerpt')}>
            <TextArea rows={3} placeholder={t('saints.excerptPlaceholder')} />
          </Form.Item>

          <Form.Item name="biography" label={t('saints.biography')}>
            <TextArea rows={5} placeholder={t('saints.biographyPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SaintDetail;
