import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Space, Popconfirm, Empty, Descriptions, Typography, Tag, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchProduct, deleteProduct } from '@/store/productsSlice';
import CenteredLoader from '@/components/CenteredLoader';

const { Title } = Typography;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentProduct, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (slug) dispatch(fetchProduct(slug));
  }, [dispatch, slug]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteProduct(currentProduct.id)).unwrap();
      message.success(t('products.deleteSuccess'));
      navigate('/products');
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const displayTitle =
    i18n.language === 'ar' && currentProduct?.title_ar
      ? currentProduct.title_ar
      : currentProduct?.title;

  const categoryName = currentProduct?.category
    ? (i18n.language === 'ar' && currentProduct.category.name_ar
        ? currentProduct.category.name_ar
        : currentProduct.category.name)
    : null;

  if (loading) return <CenteredLoader minHeight="calc(100vh - 220px)" />;

  if (!currentProduct) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description={error || t('common.notAvailable')} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
            {t('common.back')}
          </Button>
        </div>

        {currentProduct.image && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={currentProduct.image}
              alt={displayTitle}
              style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }}
            />
          </div>
        )}

        <Title level={3} style={{ color: '#6B1A1A', marginBottom: 16 }}>
          {displayTitle || t('common.notAvailable')}
        </Title>

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label={t('products.title')}>
            {currentProduct.title || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('products.title_ar')}>
            {currentProduct.title_ar || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('products.slug')}>
            {currentProduct.slug || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('products.category')}>
            {categoryName ? <Tag color="blue">{categoryName}</Tag> : t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('products.description')}>
            {currentProduct.description || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('products.description_ar')}>
            {currentProduct.description_ar || t('common.notAvailable')}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${slug}/edit`)}
            style={{ background: '#6B1A1A' }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('products.deleteConfirm', { title: displayTitle })}
            onConfirm={handleDelete}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </div>
  );
}
