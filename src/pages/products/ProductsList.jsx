import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Table, Button, Space, Popconfirm, Empty, Input, message, Avatar, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ShoppingOutlined } from '@ant-design/icons';
import { Search } from 'lucide-react';
import { fetchProducts, deleteProduct, setProductsPage } from '@/store/productsSlice';
import { PAGE_SIZE } from '@/lib/queryHelper';
import CenteredLoader from '@/components/CenteredLoader';
import { resolveMediaUrl } from '@/lib/mediaUrl';

export default function ProductsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { products, loading, error, deleting, page, total } = useSelector((state) => state.products);

  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousSearchRef = useRef('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length >= 3) setSearchDebounce(searchText);
      else if (searchText.length === 0) setSearchDebounce('');
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const searchChanged = previousSearchRef.current !== searchDebounce;
    previousSearchRef.current = searchDebounce;
    if (searchChanged && page !== 1) {
      dispatch(setProductsPage(1));
      return;
    }
    dispatch(fetchProducts({ page, search: searchDebounce }));
  }, [dispatch, page, searchDebounce]);

  const getTitle = (record) =>
    i18n.language === 'ar' && record.title_ar ? record.title_ar : record.title;

  const getCategoryName = (record) => {
    if (!record.category) return t('common.notAvailable');
    return i18n.language === 'ar' && record.category.name_ar
      ? record.category.name_ar
      : record.category.name;
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      message.success(t('products.deleteSuccess'));
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const columns = [
    {
      title: t('products.image'),
      key: 'image',
      width: 80,
      render: (_, record) =>
        record.image ? (
          <Avatar shape="square" size={48} src={resolveMediaUrl(record.image)} alt={getTitle(record)} />
        ) : (
          <Avatar shape="square" size={48} icon={<ShoppingOutlined />} />
        ),
    },
    {
      title: t('products.title'),
      key: 'title',
      render: (_, record) => getTitle(record) || t('common.notAvailable'),
    },
    {
      title: t('products.category'),
      key: 'category',
      render: (_, record) => (
        <Tag color="blue">{getCategoryName(record)}</Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/products/${record.slug}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/products/${record.slug}/edit`)} />
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('products.deleteConfirm', { title: getTitle(record) })}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            okButtonProps={{ loading: deleting }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} loading={deleting} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => dispatch(fetchProducts({ page }))}>
              {t('common.retry')}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingOutlined style={{ fontSize: 24, color: '#6B1A1A' }} />
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#6B1A1A' }}>
                {t('navigation.products')}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products/create')}
              style={{ background: '#6B1A1A' }}
            >
              {t('products.create')}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder={t('products.searchPlaceholder')}
            allowClear
            style={{ flex: 1, minWidth: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </div>

        {loading && !products.length ? (
          <CenteredLoader minHeight={320} />
        ) : products.length > 0 ? (
          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            loading={loading || deleting}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total,
              showSizeChanger: false,
              onChange: (nextPage) => dispatch(setProductsPage(nextPage)),
            }}
          />
        ) : (
          <Empty description={t('common.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products/create')}
              style={{ background: '#6B1A1A' }}
            >
              {t('products.create')}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
