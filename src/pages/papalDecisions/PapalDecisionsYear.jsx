import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Modal, message, Tag, Input, DatePicker, Alert, Select } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { 
  fetchPapalDecisions, 
  createPapalDecision, 
  clearError, 
  clearDuplicateError 
} from '@/store/papalDecisionsSlice';
import { fetchLanguages } from '@/store/translationsSlice';
import { fetchClerics } from '@/store/clericsSlice';
import dayjs from 'dayjs';

const { Title } = Typography;

const getDecisionBase = (decision) => decision?.base || decision || {};
const getDecisionId = (decision) => getDecisionBase(decision)?.id ?? decision?.id;
const getSafeRankLabel = (t, rank) => {
  if (!rank || rank === 'undefined' || rank === 'null') {
    return null;
  }

  return t(`cleric.ranks.${rank}`, { defaultValue: rank });
};
const getArabicLanguageId = (languages = []) =>
  languages.find((language) => {
    const name = language?.name?.toLowerCase?.() || '';
    const abbr = language?.abbr?.toLowerCase?.() || '';
    return abbr === 'ar' || name === 'arabic';
  })?.id ?? null;

const PapalDecisionsYear = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { year } = useParams();
  const { t, i18n } = useTranslation();
  
  const { decisionsByYear, loading, creating, error, duplicateError } = useSelector((state) => state.papalDecisions);
  const { languages } = useSelector((state) => state.translations);
  const { clerics, loading: clericsLoading } = useSelector((state) => state.clerics);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    decision_number: 1,
    issued_at: '',
    title: '',
    description: '',
    excerpt: '',
    isActive: true,
    cleric_id: null,
    language_id: null,
  });

  const yearDecisions = decisionsByYear[year] || [];
  const arabicLanguageId = getArabicLanguageId(languages);

  useEffect(() => {
    dispatch(fetchPapalDecisions());
    dispatch(fetchLanguages({ limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (showCreateModal) {
      dispatch(fetchClerics({ limit: 1000 }));
    }
  }, [dispatch, showCreateModal]);

  useEffect(() => {
    if (arabicLanguageId && !formData.language_id) {
      setFormData((prev) => ({ ...prev, language_id: arabicLanguageId }));
    }
  }, [arabicLanguageId, formData.language_id]);

  useEffect(() => {
    if (error) {
      message.error(t('papalDecisions.fetchError'));
    }
    if (duplicateError) {
      message.error(t('papalDecisions.duplicateError'));
    }
  }, [error, duplicateError, t]);

  const handleCreateDecision = async () => {
    try {
      await dispatch(createPapalDecision(formData)).unwrap();
      message.success(t('papalDecisions.createSuccess'));
      setShowCreateModal(false);
      resetFormData();
      dispatch(fetchPapalDecisions());
    } catch (error) {
      // Error is handled in the slice
    }
  };

  const handleViewDecisionTranslations = (decision) => {
    navigate(`/papal-decisions/${year}/${getDecisionId(decision)}`);
  };

  const resetFormData = () => {
    setFormData({
      decision_number: 1,
      issued_at: '',
      title: '',
      description: '',
      excerpt: '',
      isActive: true,
      cleric_id: null,
      language_id: arabicLanguageId,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDecisionNumber = () => {
    const sortedDecisions = [...yearDecisions].sort(
      (a, b) => getDecisionBase(a).decision_number - getDecisionBase(b).decision_number
    );
    const currentNumbers = sortedDecisions.map((decision) => getDecisionBase(decision).decision_number);
    let nextNumber = 1;
    
    while (currentNumbers.includes(nextNumber)) {
      nextNumber++;
    }
    
    return nextNumber;
  };

  const columns = [
    {
      title: t('papalDecisions.decisionNumber'),
      key: 'decision_number',
      render: (_, record) => (
        <Tag color="#5C1A1B" style={{ fontSize: '14px', fontWeight: 'bold' }}>
          #{getDecisionBase(record).decision_number}
        </Tag>
      ),
      sorter: (a, b) => getDecisionBase(a).decision_number - getDecisionBase(b).decision_number,
    },
    {
      title: t('papalDecisions.issuedDate'),
      key: 'issued_at',
      render: (_, record) => dayjs(getDecisionBase(record).issued_at).format('DD MMM YYYY'),
      sorter: (a, b) => new Date(getDecisionBase(a).issued_at) - new Date(getDecisionBase(b).issued_at),
    },
    {
      title: t('papalDecisions.issuer'),
      key: 'issuer',
      render: (_, record) => {
        const issuer = getDecisionBase(record).issuer;

        if (!issuer) {
          return '-';
        }

        const issuerName = i18n.language === 'ar'
          ? issuer.name || issuer.name_en
          : issuer.name_en || issuer.name;
        const issuerRankLabel = getSafeRankLabel(t, issuer.rank);

        return (
          <div>
            <div>{issuerName}</div>
            {issuerRankLabel ? (
              <Tag style={{ marginTop: 4 }}>{issuerRankLabel}</Tag>
            ) : null}
          </div>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<TranslationOutlined />}
            onClick={() => handleViewDecisionTranslations(record)}
            title={t('translations.viewTranslations')}
          />
          {/* {t('translations.viewTranslations')} */}
        </Space>
      ),
    },
  ];

  const sortedDecisions = [...yearDecisions].sort(
    (a, b) => getDecisionBase(b).decision_number - getDecisionBase(a).decision_number
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/papal-decisions')}
            >
              {t('common.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {t('papalDecisions.yearDecisions', { year })}
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              resetFormData();
              setFormData(prev => ({ ...prev, decision_number: getDecisionNumber() }));
              setShowCreateModal(true);
            }}
          >
            {t('papalDecisions.addDecision')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sortedDecisions}
          loading={loading}
          rowKey={(record) => getDecisionId(record)}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      {/* Create Decision Modal */}
      <Modal
        title={t('papalDecisions.createDecision')}
        open={showCreateModal}
        onOk={handleCreateDecision}
        onCancel={() => {
          setShowCreateModal(false);
          dispatch(clearError());
          dispatch(clearDuplicateError());
        }}
        confirmLoading={creating}
        width={600}
      >
        <DecisionForm 
          formData={formData} 
          onInputChange={handleInputChange} 
          year={parseInt(year)}
          isEdit={false}
          clerics={clerics}
          clericsLoading={clericsLoading}
        />
      </Modal>
    </div>
  );
};

// Reusable Decision Form Component
const DecisionForm = ({ formData, onInputChange, year, isEdit, clerics = [], clericsLoading = false }) => {
  const { t } = useTranslation();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert
        type="info"
        showIcon
        message="This decision will be created with Arabic as the default translation."
      />

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('papalDecisions.cleric')}
        </label>
        <Select
          value={formData.cleric_id}
          onChange={(value) => onInputChange('cleric_id', value)}
          placeholder={t('papalDecisions.selectCleric')}
          style={{ width: '100%' }}
          allowClear
          showSearch
          loading={clericsLoading}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={clerics.map((cleric) => ({
            value: cleric.id,
            label: `${cleric.name}${cleric.rank ? ` - ${t(`cleric.ranks.${cleric.rank}`)}` : ''}`,
          }))}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('papalDecisions.decisionNumber')} *
        </label>
        <Input
          type="number"
          value={formData.decision_number}
          onChange={(e) => onInputChange('decision_number', parseInt(e.target.value))}
          placeholder={t('papalDecisions.decisionNumberPlaceholder')}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('papalDecisions.issuedDate')} *
        </label>
        <DatePicker
          style={{ width: '100%' }}
          value={isEdit && formData.issued_at ? dayjs(formData.issued_at) : undefined}
          defaultPickerValue={dayjs(`${year}-01-01`)}
          disabledDate={(current) => {
            // Disable dates that are not in the current year
            return current && current.year() !== parseInt(year);
          }}
          onChange={(date) => onInputChange('issued_at', date.format('YYYY-MM-DD'))}
          placeholder={t('papalDecisions.issuedDatePlaceholder')}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('papalDecisions.title')} *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          placeholder={t('papalDecisions.titlePlaceholder')}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('papalDecisions.description')} *
        </label>
        <Input.TextArea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder={t('papalDecisions.descriptionPlaceholder')}
          rows={3}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('papalDecisions.excerpt')}
        </label>
        <Input.TextArea
          value={formData.excerpt}
          onChange={(e) => onInputChange('excerpt', e.target.value)}
          placeholder={t('papalDecisions.excerptPlaceholder')}
          rows={2}
        />
      </div>
    </div>
  );
};

export default PapalDecisionsYear;
