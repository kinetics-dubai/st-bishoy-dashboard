import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Modal, message, Input, Tag, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, TagOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchTags, deleteTag, setPage, setLimit } from '@/store/tagsSlice';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const TagsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { tags, loading, deleting, error, page, limit, total } = useSelector((state) => state.tags);
  
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousFiltersRef = useRef({
    searchDebounce: '',
    categoryFilter: null,
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
      previousFiltersRef.current.categoryFilter !== categoryFilter;

    previousFiltersRef.current = { searchDebounce, categoryFilter };

    if (filtersChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchTags({ 
      page, 
      limit, 
      search: searchDebounce,
      category: categoryFilter
    }));
  }, [dispatch, page, limit, searchDebounce, categoryFilter]);

  useEffect(() => {
    if (error) {
      message.error(t('tags.fetchError'));
    }
  }, [error, t]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const handleDelete = (tag) => {
    Modal.confirm({
      title: t('tags.deleteConfirm'),
      content: t('tags.deleteConfirmMessage', { name: tag.name, category: tag.category }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteTag(tag.id)).unwrap();
          message.success(t('tags.deleteSuccess'));
        } catch (error) {
          message.error(t('tags.deleteError'));
        }
      },
    });
  };

  const getFilteredTags = () => {
    if (!tags || !Array.isArray(tags)) return [];
    
    return tags.filter(tag => {
      if (!tag) return false;
      
      const searchMatch = !searchText || 
        tag.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        tag.slug?.toLowerCase().includes(searchText.toLowerCase());
      
      const categoryMatch = !categoryFilter || tag.category === categoryFilter;
      
      return searchMatch && categoryMatch;
    });
  };

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

  const columns = [
    {
      title: t('tags.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <Text
              strong
              style={{ display: 'block', fontSize: '16px', cursor: 'pointer' }}
              onClick={() => navigate(`/tags/${record.id}`)}
            >
              {name}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('tags.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag 
          color={getCategoryColor(category)} 
          style={{ 
            fontSize: '14px', 
            padding: '4px 12px',
            textTransform: 'capitalize',
            fontWeight: 500
          }}
        >
          {category}
        </Tag>
      ),
      filters: [
        { text: 'Article', value: 'article' },
        { text: 'Entity', value: 'entity' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tags/${record.id}`)}
            title={t('common.view')}
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

  const filteredTags = getFilteredTags();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TagOutlined style={{ color: '#5C1A1B' }} />
              {t('tags.title')}
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/tags/create')}
          >
            {t('tags.create')}
          </Button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Search
              placeholder={t('tags.searchPlaceholder')}
              allowClear
              style={{ flex: 2, minWidth: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
            <Select
              placeholder={t('tags.filterByCategory')}
              allowClear
              style={{ flex: 1, minWidth: 150 }}
              onChange={setCategoryFilter}
              value={categoryFilter}
            >
              <Option value="article">Article</Option>
              <Option value="entity">Entity</Option>
            </Select>
            {(searchText || categoryFilter) && (
              <Button
                onClick={() => {
                  setSearchText('');
                  setCategoryFilter(null);
                }}
              >
                {t('tags.clearFilters')}
              </Button>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTags}
          rowKey={(record) => record.id ?? record.base?.id}
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
          rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        />
      </Card>

      <style>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
      `}</style>
    </div>
  );
};

export default TagsList;
