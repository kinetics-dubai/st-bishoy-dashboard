import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Form, Input, Modal, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, GlobalOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { clearCurrentTag, fetchTag } from '@/store/tagsSlice';
import {
  clearCurrentTagTranslations,
  createTagTranslation,
  deleteTagTranslation,
  fetchLanguages,
  fetchTagTranslations,
} from '@/store/translationsSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const TagDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { currentTag, loading: tagLoading } = useSelector((state) => state.tags);
  const {
    languages,
    languagesLoading,
    currentTagTranslations,
    translationsLoading,
    creating,
    deleting,
  } = useSelector((state) => state.translations);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTag(id));
      dispatch(fetchTagTranslations(id));
    }

    if (!languages?.length) {
      dispatch(fetchLanguages({ limit: 1000 }));
    }

    return () => {
      dispatch(clearCurrentTag());
      dispatch(clearCurrentTagTranslations());
    };
  }, [dispatch, id]);

  const translations = useMemo(() => currentTagTranslations || [], [currentTagTranslations]);

  const usedLanguageIds = useMemo(
    () => translations.filter((item) => item?.language_id).map((item) => item.language_id),
    [translations]
  );

  const availableLanguages = useMemo(
    () => (languages || []).filter((language) => !usedLanguageIds.includes(language.id)),
    [languages, usedLanguageIds]
  );

  useEffect(() => {
    if (!isModalOpen) return;

    form.setFieldsValue({
      name: '',
      language_id: availableLanguages[0]?.id ?? null,
    });
  }, [availableLanguages, form, isModalOpen]);

  const currentTranslation = currentTag?.translation || {};
  const baseTag = currentTag?.base || currentTag || {};
  const loading = tagLoading || translationsLoading;

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

  const getLanguageName = (translation) => {
    return (
      translation?.language?.name ||
      languages.find((language) => String(language.id) === String(translation?.language_id))?.name ||
      t('common.notAvailable')
    );
  };

  const openCreateModal = () => {
    if (!availableLanguages.length) {
      message.warning(t('translations.noAvailableLanguages'));
      return;
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCreateTranslation = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(
        createTagTranslation({
          ...values,
          tag_id: Number(id),
        })
      ).unwrap();
      message.success(t('translations.createSuccess'));
      closeModal();
      dispatch(fetchTagTranslations(id));
    } catch (error) {
      if (error?.errorFields) return;
      message.error(t('translations.createError'));
    }
  };

  const handleDeleteTranslation = (translation) => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('translations.deleteConfirmMessage', {
        title: translation?.name || t('common.notAvailable'),
        language: getLanguageName(translation),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteTagTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
          dispatch(fetchTagTranslations(id));
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const columns = [
    {
      title: t('translations.language'),
      dataIndex: 'language_id',
      key: 'language',
      render: (_, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#5C1A1B' }} />
          <Text strong>{getLanguageName(record)}</Text>
          <Text type="secondary">#{record?.language_id ?? 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: t('tags.name'),
      dataIndex: 'name',
      key: 'name',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('translations.publishedAt'),
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (value) => value ? new Date(value).toLocaleString() : t('common.notAvailable'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteTranslation(record)}
          loading={deleting}
          title={t('common.delete')}
        />
      ),
    },
  ];

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
                  <TagOutlined style={{ color: '#5C1A1B' }} />
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

        <Card
          title={t('translations.title')}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              disabled={!availableLanguages.length}
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

      <Modal
        title={t('translations.createTranslation')}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleCreateTranslation}
        confirmLoading={creating}
        okText={t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="language_id"
            label={t('translations.language')}
            rules={[{ required: true, message: t('translations.selectLanguage') }]}
          >
            <Select
              placeholder={languagesLoading ? t('common.loading') : t('translations.selectLanguage')}
              loading={languagesLoading}
            >
              {availableLanguages.map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name} {language.abbr ? `(${language.abbr})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={t('tags.name')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('tags.namePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagDetail;
