import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Modal, message, Tag, Input, Select, Divider } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, GlobalOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchLanguages,
  fetchPapalDecisionTranslations,
  createPapalDecisionTranslation,
  updatePapalDecisionTranslation,
  deletePapalDecisionTranslation
} from '@/store/translationsSlice';
import { fetchPapalDecisions } from '@/store/papalDecisionsSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const getDecisionBase = (decision) => decision?.base || decision || {};
const getDecisionTranslation = (decision) => decision?.translation || {};
const getDecisionId = (decision) => getDecisionBase(decision)?.id ?? decision?.id;
const getArabicLanguageId = (languages = []) =>
  languages.find((language) => {
    const name = language?.name?.toLowerCase?.() || '';
    const abbr = language?.abbr?.toLowerCase?.() || '';
    return abbr === 'ar' || name === 'arabic';
  })?.id ?? null;

const PapalDecisionDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { year, decisionId } = useParams();
  const { t } = useTranslation();

  const { decisionsByYear, loading: decisionsLoading } = useSelector((state) => state.papalDecisions);
  const {
    languages,
    currentDecisionTranslations,
    languagesLoading,
    translationsLoading,
    creating: creatingTranslation,
    updating: updatingTranslation,
    error: translationError
  } = useSelector((state) => state.translations);

  const [showCreateTranslationModal, setShowCreateTranslationModal] = useState(false);
  const [showViewTranslationModal, setShowViewTranslationModal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [translationFormData, setTranslationFormData] = useState({
    title: '',
    description: '',
    excerpt: '',
    language_id: null,
  });

  const yearDecisions = Array.isArray(decisionsByYear?.[year]) ? decisionsByYear[year] : [];
  const currentDecisionRecord = yearDecisions.find(
    (decision) => decision && String(getDecisionId(decision)) === String(decisionId)
  );
  const currentDecision = getDecisionBase(currentDecisionRecord);
  const currentDecisionTranslation = getDecisionTranslation(currentDecisionRecord);
  const isLoading = decisionsLoading || languagesLoading;
  const arabicLanguageId = getArabicLanguageId(languages);

  useEffect(() => {
    dispatch(fetchPapalDecisions());
    dispatch(fetchLanguages({ limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (showCreateTranslationModal && !translationFormData.language_id) {
      const availableLanguages = getAvailableLanguages(editingTranslation);
      const defaultLanguageId = availableLanguages.find((language) => language.id === arabicLanguageId)?.id
        || availableLanguages[0]?.id
        || null;

      if (defaultLanguageId) {
        setTranslationFormData((prev) => ({ ...prev, language_id: defaultLanguageId }));
      }
    }
  }, [arabicLanguageId, languages, currentDecisionTranslations, showCreateTranslationModal, translationFormData.language_id]);

  useEffect(() => {
    if (decisionId) {
      dispatch(fetchPapalDecisionTranslations(decisionId));
    }
  }, [dispatch, decisionId]);

  useEffect(() => {
    if (translationError) {
      message.error(translationError || t('translations.fetchError'));
    }
  }, [translationError, t]);

  const handleSaveTranslation = async () => {
    try {
      if (editingTranslation) {
        await dispatch(updatePapalDecisionTranslation({
          id: editingTranslation.id,
          data: {
            title: translationFormData.title,
            description: translationFormData.description,
            excerpt: translationFormData.excerpt,
          },
        })).unwrap();
        message.success(t('translations.updateSuccess'));
      } else {
        const languageAlreadyExists = currentDecisionTranslations.some(
          (translation) => String(translation?.language_id) === String(translationFormData.language_id)
        );

        if (languageAlreadyExists) {
          message.error('This language already has a translation for this papal decision.');
          return;
        }

        await dispatch(createPapalDecisionTranslation({
          ...translationFormData,
          papal_decision_id: currentDecision?.id ?? decisionId,
        })).unwrap();
        message.success(t('translations.createSuccess'));
      }
      setShowCreateTranslationModal(false);
      setEditingTranslation(null);
      resetTranslationFormData();
      dispatch(fetchPapalDecisionTranslations(decisionId));
    } catch (error) {
      // Error is handled in the slice
    }
  };

  const openCreateTranslationModal = () => {
    const availableLanguages = getAvailableLanguages();

    setEditingTranslation(null);
    setTranslationFormData({
      title: '',
      description: '',
      excerpt: '',
      language_id: availableLanguages.find((language) => language.id === arabicLanguageId)?.id
        || availableLanguages[0]?.id
        || null,
    });
    setShowCreateTranslationModal(true);
  };

  const openEditTranslationModal = (translation) => {
    setEditingTranslation(translation);
    setTranslationFormData({
      title: translation?.title || '',
      description: translation?.description || '',
      excerpt: translation?.excerpt || '',
      language_id: translation?.language_id || arabicLanguageId,
    });
    setShowCreateTranslationModal(true);
  };

  const openViewTranslationModal = (translation) => {
    setSelectedTranslation(translation);
    setShowViewTranslationModal(true);
  };

  const handleDeleteTranslation = (translation) => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('translations.deleteConfirmMessage', {
        title: translation.title,
        language: translation.language?.name || t('common.unknown')
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deletePapalDecisionTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const resetTranslationFormData = () => {
    setTranslationFormData({
      title: '',
      description: '',
      excerpt: '',
      language_id: arabicLanguageId,
    });
  };

  const handleTranslationInputChange = (field, value) => {
    setTranslationFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAvailableLanguages = (currentTranslation = null) => {
    if (!languages || languages.length === 0) return [];

    if (!currentDecisionTranslations || currentDecisionTranslations.length === 0) {
      return languages;
    }

    const usedLanguageIds = currentDecisionTranslations
      .filter((translation) => translation?.language_id && translation.id !== currentTranslation?.id)
      .map(t => t.language_id);

    return languages.filter(lang => lang && !usedLanguageIds.includes(lang.id));
  };

  const translationColumns = [
    {
      title: t('translations.language'),
      dataIndex: ['language', 'name'],
      key: 'language',
      render: (language, record) => (
        <Space size={8} style={{ alignItems: 'center' }}>
          <GlobalOutlined style={{ color: '#5C1A1B' }} />
          <div>
            <Text strong style={{ display: 'block', lineHeight: 1.3 }}>{language || t('common.unknown')}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record?.language?.abbr || 'N/A'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('translations.translationTitle'),
      dataIndex: 'title',
      key: 'title',
      render: (title) => (
        <Text strong style={{ display: 'block', fontSize: '14px', lineHeight: 1.4 }}>
          {title || t('common.notAvailable')}
        </Text>
      ),
    },
    {
      title: t('translations.translationDescription'),
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <Text type="secondary" style={{ fontSize: '13px', display: 'block', lineHeight: 1.4 }}>
          {description ? (description.length > 60 ? `${description.substring(0, 60)}...` : description) : t('common.notAvailable')}
        </Text>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openViewTranslationModal(record)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditTranslationModal(record)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTranslation(record)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  // Show loading while fetching data
  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>{t('common.loading')}</Title>
          </div>
        </Card>
      </div>
    );
  }

  // Show not found only after loading is complete
  if (!currentDecisionRecord) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>{t('common.notFound')}</Title>
            <Button type="primary" onClick={() => navigate(`/papal-decisions/${year}`)}>
              {t('common.back')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/papal-decisions/${year}`)}
            >
              {t('common.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {t('papalDecisions.decisionDetails')}
            </Title>
          </div>
        </div>

        {/* Decision Details */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <Tag color="#5C1A1B" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                #{currentDecision.decision_number}
              </Tag>
              <Title level={4} style={{ margin: '8px 0' }}>
                {currentDecisionTranslation.title || t('papalDecisions.decision')}
              </Title>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Text strong>{t('papalDecisions.description')}</Text>
            <Paragraph style={{ marginTop: '8px' }}>
              {currentDecisionTranslation.description || t('common.notAvailable')}
            </Paragraph>
          </div>

          {currentDecisionTranslation.excerpt && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong>{t('papalDecisions.excerpt')}</Text>
              <Paragraph style={{ marginTop: '8px', fontStyle: 'italic' }}>
                {currentDecisionTranslation.excerpt}
              </Paragraph>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Tag color={currentDecision.isActive ? 'success' : 'default'}>
              {currentDecision.isActive ? t('papalDecisions.active') : t('papalDecisions.inactive')}
            </Tag>
            <Tag color="blue">
              {t('papalDecisions.year')}: {currentDecision.decision_year}
            </Tag>
          </div>
        </div>

        <Divider />

        {/* Translations Section */}
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              {t('translations.title')}
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateTranslationModal}
              disabled={getAvailableLanguages()?.length === 0}
            >
              {t('translations.addTranslation')}
            </Button>
          </div>

          <Table
            columns={translationColumns}
            dataSource={currentDecisionTranslations}
            loading={translationsLoading}
            rowKey="id"
            size="middle"
            locale={{
              emptyText: currentDecisionTranslations.length === 0 ?
                t('translations.noTranslations') :
                t('common.loading')
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                t('common.pagination', { start: range[0], end: range[1], total }),
            }}
          />
        </div>
      </Card>

      {/* Create Translation Modal */}
      <Modal
        title={editingTranslation ? t('common.edit') : t('translations.createTranslation')}
        open={showCreateTranslationModal}
        onOk={handleSaveTranslation}
        onCancel={() => {
          setShowCreateTranslationModal(false);
          setEditingTranslation(null);
          resetTranslationFormData();
        }}
        confirmLoading={creatingTranslation || updatingTranslation}
        okText={editingTranslation ? t('common.update') : t('common.create')}
        width={600}
      >
        <TranslationForm
          formData={translationFormData}
          onInputChange={handleTranslationInputChange}
          languages={getAvailableLanguages(editingTranslation)}
          languagesLoading={languagesLoading}
          disableLanguage={Boolean(editingTranslation)}
        />
      </Modal>

      <Modal
        title={selectedTranslation?.title || t('translations.title')}
        open={showViewTranslationModal}
        onCancel={() => {
          setShowViewTranslationModal(false);
          setSelectedTranslation(null);
        }}
        footer={null}
        width={700}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text strong>{t('translations.language')}</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              {selectedTranslation?.language?.name || t('common.unknown')}
              {selectedTranslation?.language?.abbr ? ` (${selectedTranslation.language.abbr})` : ''}
            </Paragraph>
          </div>

          <div>
            <Text strong>{t('translations.translationDescription')}</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              {selectedTranslation?.description || t('common.notAvailable')}
            </Paragraph>
          </div>

          <div>
            <Text strong>{t('translations.translationExcerpt')}</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              {selectedTranslation?.excerpt || t('common.notAvailable')}
            </Paragraph>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Reusable Translation Form Component
const TranslationForm = ({ formData, onInputChange, languages, languagesLoading, disableLanguage = false }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('translations.language')} *
        </label>
        <Select
          value={formData.language_id}
          onChange={(value) => onInputChange('language_id', value)}
          placeholder={languagesLoading ? t('common.loading') : t('translations.selectLanguage')}
          loading={languagesLoading}
          style={{ width: '100%' }}
          disabled={disableLanguage || !languages || languages.length === 0}
        >
          {languages?.map(language => (
            <Option key={language.id} value={language.id}>
              {language.name} ({language.abbr})
            </Option>
          ))}
        </Select>
        {!languagesLoading && (!languages || languages.length === 0) && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            {t('translations.noAvailableLanguages')}
          </Text>
        )}
        {languages && languages.length > 0 && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            {t('translations.availableLanguages', { count: languages.length })}
          </Text>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('translations.translationTitle')} *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          placeholder={t('translations.titlePlaceholder')}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('translations.translationDescription')} *
        </label>
        <Input.TextArea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder={t('translations.descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('translations.translationExcerpt')}
        </label>
        <Input.TextArea
          value={formData.excerpt}
          onChange={(e) => onInputChange('excerpt', e.target.value)}
          placeholder={t('translations.excerptPlaceholder')}
          rows={2}
        />
      </div>
    </div>
  );
};

export default PapalDecisionDetail;
