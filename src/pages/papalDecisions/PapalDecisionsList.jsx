import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Modal, message, Input, DatePicker, Select, Alert } from 'antd';
import { PlusOutlined, EyeOutlined, CalendarOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchPapalDecisions, createPapalDecision, clearError, clearDuplicateError, setPage, setLimit } from '@/store/papalDecisionsSlice';
import { fetchLanguages } from '@/store/translationsSlice';
import { fetchClerics } from '@/store/clericsSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const getArabicLanguageId = (languages = []) =>
  languages.find((language) => {
    const name = language?.name?.toLowerCase?.() || '';
    const abbr = language?.abbr?.toLowerCase?.() || '';
    return abbr === 'ar' || name === 'arabic';
  })?.id ?? null;

const PapalDecisionsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { decisionsByYear, loading, creating, error, duplicateError, page, limit, total } = useSelector((state) => state.papalDecisions);
  const { languages } = useSelector((state) => state.translations);
  const { clerics, loading: clericsLoading } = useSelector((state) => state.clerics);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [yearFilter, setYearFilter] = useState('all');
  const previousYearFilterRef = useRef('all');
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
  const arabicLanguageId = getArabicLanguageId(languages);

  useEffect(() => {
    const yearFilterChanged = previousYearFilterRef.current !== yearFilter;
    previousYearFilterRef.current = yearFilter;

    if (yearFilterChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchPapalDecisions({
      page,
      limit,
      decision_year: yearFilter !== 'all' ? yearFilter : undefined
    }));
  }, [dispatch, page, limit, yearFilter]);

  useEffect(() => {
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
      await dispatch(fetchPapalDecisions({
        page,
        limit,
        decision_year: yearFilter !== 'all' ? yearFilter : undefined
      }));
      message.success(t('papalDecisions.createSuccess'));
      setShowCreateModal(false);
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
    } catch (error) {
      // Error is handled in the slice
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2015; year--) {
      years.push(year);
    }
    return years;
  };

  const getYearsData = () => {
    if (!decisionsByYear || typeof decisionsByYear !== 'object') return [];
    
    const years = Object.keys(decisionsByYear).map(year => ({
      key: year,
      year: parseInt(year),
      decisionsCount: decisionsByYear[year]?.length || 0,
      decisions: decisionsByYear[year] || [],
    }));

    // Apply year filter if set
    if (yearFilter !== 'all') {
      return years.filter(item => item && item.year === parseInt(yearFilter));
    }

    return years.sort((a, b) => b.year - a.year);
  };

  const columns = [
    {
      title: t('papalDecisions.year'),
      dataIndex: 'year',
      key: 'year',
      render: (year) => (
        <Space>
          <CalendarOutlined style={{ color: '#5C1A1B' }} />
          <Text strong>{year}</Text>
        </Space>
      ),
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: t('papalDecisions.decisionsCount'),
      dataIndex: 'decisionsCount',
      key: 'decisionsCount',
      render: (count) => (
        <Space>
          <FileTextOutlined style={{ color: '#5C1A1B' }} />
          <Text>{count} {t('papalDecisions.decisions')}</Text>
        </Space>
      ),
      sorter: (a, b) => a.decisionsCount - b.decisionsCount,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/papal-decisions/${record.year}`)}
          >
            {t('papalDecisions.viewDecisions')}
          </Button>
        </Space>
      ),
    },
  ];

  const yearsData = getYearsData();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            {t('papalDecisions.title')}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            {t('papalDecisions.createDecision')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            value={yearFilter}
            onChange={setYearFilter}
            style={{ width: 150 }}
            placeholder={t('papalDecisions.filterByYear') || 'Filter by year'}
          >
            <Option value="all">{t('papalDecisions.allYears') || 'All Years'}</Option>
            {getYearOptions().map(year => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={yearsData}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: handlePageChange,
            onShowSizeChange: (_, newLimit) => handleLimitChange(newLimit),
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          rowClassName={(record) => record.decisionsCount === 0 ? 'empty-year-row' : ''}
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
              onChange={(value) => handleInputChange('cleric_id', value)}
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
              onChange={(e) => handleInputChange('decision_number', parseInt(e.target.value))}
              placeholder={t('papalDecisions.decisionNumberPlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              {t('papalDecisions.issuedDate')} *
            </label>
            <DatePicker
              style={{ width: '100%' }}
              defaultPickerValue={dayjs(`${new Date().getFullYear()}-01-01`)}
              disabledDate={(current) => {
                // Disable dates that are not in the current year (based on issued_at)
                if (!current) return false;
                const currentYear = new Date().getFullYear();
                return current.year() !== currentYear;
              }}
              onChange={(date) => handleInputChange('issued_at', date.format('YYYY-MM-DD'))}
              placeholder={t('papalDecisions.issuedDatePlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              {t('papalDecisions.title')} *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t('papalDecisions.titlePlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              {t('papalDecisions.description')} *
            </label>
            <Input.TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
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
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder={t('papalDecisions.excerptPlaceholder')}
              rows={2}
            />
          </div>
        </div>
      </Modal>

      <style>{`
        .empty-year-row {
          background-color: #fff5f5;
        }
        .ant-table-tbody > .empty-year-row:hover > td {
          background-color: #ffe8e8 !important;
        }
      `}</style>
    </div>
  );
};

export default PapalDecisionsList;
