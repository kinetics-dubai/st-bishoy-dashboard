import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Tabs, Input, Button, Space, Modal, message } from 'antd';
import { BookOutlined, EyeOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchBooks, deleteBook, setPage, setLimit } from '@/store/booksSlice';

const { TabPane } = Tabs;
const { Search } = Input;

const BooksList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const { books, loading, deleting, error, page, limit, total } = useSelector((state) => state.books);
  
  const [searchText, setSearchText] = useState('');
  const [testamentFilter, setTestamentFilter] = useState('new');
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousFiltersRef = useRef({
    searchDebounce: '',
    testamentFilter: 'new',
  });

  // Get testament from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTestament = params.get('testament');
    if (urlTestament && ['old', 'new'].includes(urlTestament)) {
      setTestamentFilter(urlTestament);
    }
  }, [location.search]);

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
      previousFiltersRef.current.testamentFilter !== testamentFilter;

    previousFiltersRef.current = { searchDebounce, testamentFilter };

    if (filtersChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchBooks({ 
      page, 
      limit, 
      search: searchDebounce,
      testament: testamentFilter !== 'all' ? testamentFilter : undefined
    }));
  }, [dispatch, page, limit, searchDebounce, testamentFilter]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const handleDelete = (book) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('bible.deleteConfirm', { title: book.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteBook(book.id)).unwrap();
          message.success(t('bible.deleteSuccess'));
        } catch (error) {
          message.error(t('bible.deleteError'));
        }
      },
    });
  };

  const getTestamentColor = (testament) => {
    return testament === 'old' ? 'default' : 'blue';
  };

  const columns = [
    {
      title: t('bible.bookId'),
      dataIndex: 'id',
      key: 'id',
      width: 90,
    },
    {
      title: t('bible.bookTitle'),
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text || t('bible.noTranslation')}</strong>,
    },
    {
      title: t('bible.testament'),
      dataIndex: 'testament',
      key: 'testament',
      width: 120,
      render: (testament) => (
        <Tag color={getTestamentColor(testament)}>
          {t(`bible.testaments.${testament}`)}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 230,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/bible/books/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<GlobalOutlined />}
            onClick={() => navigate(`/bible/books/${record.id}/translations`)}
            title={t('translations.viewTranslations')}
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

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>{t('bible.error')}</h3>
            <Button type="primary" onClick={() => dispatch(fetchBooks())}>
              {t('common.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
        <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <BookOutlined style={{ color: '#5C1A1B' }} />
              <h2 style={{ margin: 0 }}>{t('bible.title')}</h2>
            </div>
          </div>
        }
      >
        <Tabs
          activeKey={testamentFilter}
          onChange={setTestamentFilter}
          type="card"
          size="large"
        >
          <TabPane 
            tab={t('bible.newTestament')} 
            key="new"
          >
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Search
                placeholder={t('bible.searchPlaceholder')}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <Table
              columns={columns}
              dataSource={books?.filter((book) => book && book.testament === 'new') || []}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: limit,
                total,
                onChange: handlePageChange,
                onShowSizeChange: (_, newLimit) => handleLimitChange(newLimit),
                showSizeChanger: false,
                showQuickJumper: false,

              }}
            />
          </TabPane>
          
          <TabPane 
            tab={t('bible.oldTestament')} 
            key="old"
          >
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Search
                placeholder={t('bible.searchPlaceholder')}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <Table
              columns={columns}
              dataSource={books?.filter((book) => book && book.testament === 'old') || []}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: limit,
                total,
                onChange: handlePageChange,
                onShowSizeChange: (_, newLimit) => handleLimitChange(newLimit),
                showSizeChanger: false,
                showQuickJumper: false,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BooksList;
