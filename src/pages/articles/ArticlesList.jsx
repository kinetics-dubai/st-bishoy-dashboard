import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Modal, message, Input, Tag, Badge, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, TagOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchArticles, deleteArticle, clearError, setPage, setLimit } from '@/store/articlesSlice';
import { getApiErrorMessage } from '@/lib/apiError';

const { Title, Text } = Typography;
const { Search } = Input;

const ArticlesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { articles, loading, deleting, error, page, limit, total } = useSelector((state) => state.articles);
  
  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousSearchRef = useRef('');

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
    const searchChanged = previousSearchRef.current !== searchDebounce;
    previousSearchRef.current = searchDebounce;

    if (searchChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchArticles({
      page,
      limit,
      search: searchDebounce,
    }));
  }, [dispatch, page, limit, searchDebounce]);

  useEffect(() => {
    if (error) {
      message.error(t('articles.fetchError'));
    }
  }, [error, t]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const handleDelete = (article) => {
    Modal.confirm({
      title: t('articles.deleteConfirm'),
      content: t('articles.deleteConfirmMessage', { title: article.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteArticle(article.id)).unwrap();
          message.success(t('articles.deleteSuccess'));
        } catch (error) {
          message.error(getApiErrorMessage(error, t('articles.deleteError')));
        }
      },
    });
  };

  const handleTagClick = (tag) => {
    navigate(`/tags/${tag.id}`);
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusText = (isActive) => {
    return isActive ? t('articles.active') : t('articles.inactive');
  };

  const columns = [
    {
      title: t('articles.title'),
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, #6B1A1A 0%, #8B2A3A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <FileTextOutlined />
          </div>
          <div>
            <Text strong style={{ display: 'block', fontSize: '16px' }}>
              {title}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {record.slug}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
    },
    {
      title: t('articles.tags'),
      dataIndex: 'Tags',
      key: 'tags',
      render: (tags) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {tags && Array.isArray(tags) && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag
                key={tag?.id || Math.random()}
                color="blue"
                style={{ 
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleTagClick(tag)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {tag.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('articles.noTags')}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t('articles.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Badge 
          status={isActive ? 'success' : 'default'}
          text={getStatusText(isActive)}
          color={getStatusColor(isActive)}
        />
      ),
      filters: [
        { text: t('articles.active'), value: true },
        { text: t('articles.inactive'), value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
  ];

  const activeCount = articles?.filter(a => a && a.isActive).length || 0;
  const inactiveCount = articles?.filter(a => a && !a.isActive).length || 0;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: '#6B1A1A' }} />
              {t('articles.title')}
            </Title>
    
          </div>
          {/* <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/articles/create')}
          >
            {t('articles.create')}
          </Button> */}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <Search
            placeholder={t('articles.searchPlaceholder')}
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            prefix={<FileTextOutlined style={{ color: '#6B1A1A' }} />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={articles}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: handlePageChange,
            onShowSizeChange: (_, newLimit) => handleLimitChange(newLimit),
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) =>
              t('common.showing', { start: range[0], end: range[1], total }),
          }}
          rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        />
      </Card>

      <style>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #F9F5EE;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        .ant-tag:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default ArticlesList;
