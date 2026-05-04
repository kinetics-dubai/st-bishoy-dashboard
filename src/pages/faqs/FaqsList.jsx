import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Tag, Space, Modal, message, Input, Select, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchFaqs, deleteFaq, clearError, setPage, setLimit } from '@/store/faqsSlice';

const { Search } = Input;
const { Option } = Select;

const FaqsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { faqs, loading, deleting, error, page, limit, total } = useSelector((state) => state.faqs);
  
  const [searchText, setSearchText] = useState('');
  const [languageFilter, setLanguageFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousFiltersRef = useRef({
    searchDebounce: '',
    languageFilter: null,
    statusFilter: null,
  });

  // Debounce search to trigger after 3 characters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length >= 3) {
        setSearchDebounce(searchText);
      } else if (searchText.length === 0) {
        setSearchDebounce('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const filtersChanged =
      previousFiltersRef.current.searchDebounce !== searchDebounce ||
      previousFiltersRef.current.languageFilter !== languageFilter ||
      previousFiltersRef.current.statusFilter !== statusFilter;

    previousFiltersRef.current = { searchDebounce, languageFilter, statusFilter };

    if (filtersChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchFaqs({ 
      page, 
      limit, 
      search: searchDebounce,
      lang: languageFilter,
      active: statusFilter
    }));
  }, [dispatch, page, limit, searchDebounce, languageFilter, statusFilter]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const handleDelete = (faq) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('faqs.deleteConfirm', { title: faq.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteFaq(faq.id)).unwrap();
          message.success(t('faqs.deleteSuccess'));
        } catch (error) {
          message.error(t('faqs.deleteError'));
        }
      },
    });
  };

  const getCategoryColor = (lang) => {
    switch (lang) {
      case 'ar':
        return 'blue';
      case 'fr':
        return 'green';
      case 'en':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: t('faqs.title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: t('faqs.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text.length > 100 ? `${text.substring(0, 100)}...` : text,
    },
    {
      title: t('faqs.language'),
      dataIndex: 'lang',
      key: 'lang',
      width: 100,
      render: (lang) => (
        <Tag color={lang === 'ar' ? 'blue' : lang === 'fr' ? 'green' : 'orange'}>
          {lang.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('faqs.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/faqs/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/faqs/${record.id}/edit`)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleting}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2>{t('faqs.title')}</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/faqs/create')}
          >
            {t('faqs.create')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Search
              placeholder={t('faqs.searchPlaceholder')}
              allowClear
              style={{ flex: 2, minWidth: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
            <Select
              placeholder={t('faqs.filterByLanguage')}
              allowClear
              style={{ flex: 1, minWidth: 150 }}
              onChange={setLanguageFilter}
              value={languageFilter}
            >
              <Option value="ar">العربية</Option>
              <Option value="en">English</Option>
              <Option value="fr">Français</Option>
            </Select>
            <Select
              placeholder={t('faqs.filterByStatus')}
              allowClear
              style={{ flex: 1, minWidth: 150 }}
              onChange={setStatusFilter}
              value={statusFilter}
            >
              <Option value={true}>{t('common.active')}</Option>
              <Option value={false}>{t('common.inactive')}</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={faqs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: handlePageChange,
            onShowSizeChange: (_, newLimit) => handleLimitChange(newLimit),
            showSizeChanger: false,
            showQuickJumper: false,
          }}
        />
      </Card>
    </div>
  );
};

export default FaqsList;
