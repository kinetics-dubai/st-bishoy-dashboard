import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  message,
  Modal,
  Typography,
  Table,
  Tag,
  Form,
  Select,
  Input,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchVerseGroup,
  deleteVerseGroup,
  createVerseGroupTranslation,
  updateVerseGroupTranslation,
  deleteVerseGroupTranslation,
} from '@/store/booksSlice';
import { fetchLanguages } from '@/store/translationsSlice';
import CenteredLoader from '@/components/CenteredLoader';

const { Text } = Typography;
const { Option } = Select;

const VerseGroupDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const [translationForm] = Form.useForm();
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);

  const {
    currentVerseGroup,
    verseGroupsLoading,
    deletingVerseGroup,
    creatingVerseGroupTranslation,
    updatingVerseGroupTranslation,
    deletingVerseGroupTranslation,
  } = useSelector((state) => state.books);

  const { languages, languagesLoading } = useSelector((state) => state.translations);

  useEffect(() => {
    if (id) {
      dispatch(fetchVerseGroup(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!languages?.length) {
      dispatch(fetchLanguages({ limit: 1000 }));
    }
  }, [dispatch, languages]);

  const refreshVerseGroup = () => {
    if (id) {
      dispatch(fetchVerseGroup(id));
    }
  };

  const handleDeleteVerseGroup = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('bible.deleteVerseGroupConfirm', {
        range: `${currentVerseGroup?.start_verse}-${currentVerseGroup?.end_verse}`,
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteVerseGroup(id)).unwrap();
          message.success(t('bible.deleteVerseGroupSuccess'));
          navigate(`/bible/chapters/${currentVerseGroup?.chapter_id || '1'}`);
        } catch (error) {
          message.error(t('bible.deleteVerseGroupError'));
        }
      },
    });
  };

  const handleOpenCreateTranslation = () => {
    setEditingTranslation(null);
    translationForm.resetFields();
    setIsTranslationModalOpen(true);
  };

  const handleOpenEditTranslation = (translation) => {
    setEditingTranslation(translation);
    translationForm.setFieldsValue({
      language_id: translation.language_id,
      verse_content: translation.verse_content,
      commentary: translation.commentary,
    });
    setIsTranslationModalOpen(true);
  };

  const handleCloseTranslationModal = () => {
    setIsTranslationModalOpen(false);
    setEditingTranslation(null);
    translationForm.resetFields();
  };

  const handleSubmitTranslation = async () => {
    try {
      const values = await translationForm.validateFields();
      const payload = {
        ...values,
        verse_group_id: Number(id),
      };

      if (editingTranslation) {
        await dispatch(
          updateVerseGroupTranslation({
            id: editingTranslation.id,
            data: payload,
          })
        ).unwrap();
        message.success(t('bible.updateTranslationSuccess'));
      } else {
        await dispatch(createVerseGroupTranslation(payload)).unwrap();
        message.success(t('bible.createTranslationSuccess'));
      }

      handleCloseTranslationModal();
      refreshVerseGroup();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(editingTranslation ? t('bible.updateTranslationError') : t('bible.createTranslationError'));
    }
  };

  const handleDeleteTranslation = (translation) => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('bible.deleteTranslationConfirm', {
        language: translation.language?.name || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteVerseGroupTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
          refreshVerseGroup();
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const availableLanguages = useMemo(() => {
    if (!languages?.length) return [];
    if (editingTranslation) return languages;

    const usedLanguageIds = (currentVerseGroup?.translations || [])
      .filter((translation) => translation?.language_id)
      .map((translation) => translation.language_id);

    return languages.filter((language) => !usedLanguageIds.includes(language.id));
  }, [languages, currentVerseGroup, editingTranslation]);

  const translationColumns = [
    {
      title: t('translations.language'),
      dataIndex: ['language', 'name'],
      key: 'language',
      width: 180,
      render: (_, record) => (
        <Space>
          <Text strong>{record.language?.name || t('common.notAvailable')}</Text>
          <Tag>{record.language?.abbr || '-'}</Tag>
        </Space>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditTranslation(record)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTranslation(record)}
            loading={deletingVerseGroupTranslation}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  if (verseGroupsLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <CenteredLoader minHeight="calc(100vh - 220px)" />
      </div>
    );
  }

  if (!currentVerseGroup) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>{t('bible.verseGroupNotFound')}</h3>
            <Button type="primary" onClick={() => navigate('/bible/books')}>
              {t('bible.backToBooks')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflowX: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0 }}>
              {t('bible.verseRange')}: {currentVerseGroup.start_verse} - {currentVerseGroup.end_verse}
            </h2>
            <Text type="secondary">{currentVerseGroup.chapter?.title}</Text>
          </div>

          <Space wrap>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/bible/chapters/${currentVerseGroup.chapter_id}`)}
            >
              {t('common.back')}
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              style={{ background: '#5C1A1B', border: 'none' }}
              onClick={() => navigate(`/bible/verse-groups/${id}/edit`)}
            >
              {t('common.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deletingVerseGroup}
              onClick={handleDeleteVerseGroup}
            >
              {t('common.delete')}
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text strong>{t('bible.verseContent')}</Text>
          <div style={{ marginTop: '6px', padding: '16px', background: '#fafafa', borderRadius: '8px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {currentVerseGroup.verse_content}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Text strong>{t('bible.commentary')}</Text>
          <div style={{ marginTop: '6px', padding: '16px', background: '#fafafa', borderRadius: '8px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {currentVerseGroup.commentary}
          </div>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>{t('translations.title')}</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateTranslation}
            style={{ background: '#5C1A1B', border: 'none' }}
          >
            {t('translations.addTranslation')}
          </Button>
        </div>

        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table
            rowKey="id"
            columns={translationColumns}
            dataSource={currentVerseGroup.translations || []}
            scroll={{ x: 'max-content' }}
            pagination={false}
            locale={{ emptyText: t('translations.noTranslations') }}
          />
        </div>
      </Card>

      <Modal
        title={editingTranslation ? t('bible.editTranslation') : t('bible.createTranslation')}
        open={isTranslationModalOpen}
        onCancel={handleCloseTranslationModal}
        onOk={handleSubmitTranslation}
        okText={editingTranslation ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
        okButtonProps={{ loading: creatingVerseGroupTranslation || updatingVerseGroupTranslation }}
      >
        <Form form={translationForm} layout="vertical">
          <Form.Item
            name="language_id"
            label={t('translations.language')}
            rules={[{ required: true, message: t('translations.selectLanguage') }]}
          >
            <Select
              showSearch
              placeholder={t('translations.selectLanguage')}
              loading={languagesLoading}
              optionFilterProp="children"
            >
              {availableLanguages.map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name} ({language.abbr})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="verse_content"
            label={t('bible.verseContent')}
            rules={[{ required: true, message: t('bible.verseContentRequired') }]}
          >
            <Input.TextArea rows={4} placeholder={t('bible.verseContentPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="commentary"
            label={t('bible.commentary')}
            rules={[{ required: true, message: t('bible.commentaryRequired') }]}
          >
            <Input.TextArea rows={4} placeholder={t('bible.commentaryPlaceholder')} />
          </Form.Item>

          {!languagesLoading && !availableLanguages.length && (
            <Text type="secondary">{t('translations.noAvailableLanguages')}</Text>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default VerseGroupDetail;
