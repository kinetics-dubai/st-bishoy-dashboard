import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Popconfirm, Empty, Badge, Typography, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchArticle, deleteArticle } from '@/store/articlesSlice';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import CenteredLoader from '@/components/CenteredLoader';

const { Title, Text } = Typography;

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentArticle, loading, error } = useSelector((state) => state.articles);

  useEffect(() => {
    if (id) dispatch(fetchArticle(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteArticle(id)).unwrap();
      message.success(t('articles.deleteSuccess'));
      navigate('/articles');
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const displayTitle =
    i18n.language === 'ar' && currentArticle?.title_ar
      ? currentArticle.title_ar
      : currentArticle?.title;

  if (loading) return <CenteredLoader minHeight="calc(100vh - 220px)" />;

  if (!currentArticle) {
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
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/articles')}>
            {t('common.back')}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Title level={3} style={{ color: '#6B1A1A', margin: 0 }}>
            {displayTitle || t('common.notAvailable')}
          </Title>
          <Badge
            status={currentArticle.published ? 'success' : 'default'}
            text={currentArticle.published ? t('articles.publishedStatus') : t('articles.draftStatus')}
          />
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {currentArticle.cover_image && (
            <Col xs={24} md={12}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {t('articles.coverImageLabel')}
              </Text>
              <img
                src={resolveMediaUrl(currentArticle.cover_image)}
                alt={displayTitle}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
              />
            </Col>
          )}
          {currentArticle.thumbnail && (
            <Col xs={24} md={12}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {t('articles.thumbnailLabel')}
              </Text>
              <img
                src={resolveMediaUrl(currentArticle.thumbnail)}
                alt={displayTitle}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
              />
            </Col>
          )}
        </Row>

        {currentArticle.content && (
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('articles.contentLabel')}
            </Text>
            <div
              style={{ padding: '16px', background: '#fafafa', borderRadius: 8, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentArticle.content }}
            />
          </div>
        )}

        {currentArticle.content_ar && (
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('articles.contentArLabel')}
            </Text>
            <div
              dir="rtl"
              style={{ padding: '16px', background: '#fafafa', borderRadius: 8, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentArticle.content_ar }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/articles/${id}/edit`)}
            style={{ background: '#6B1A1A' }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('articles.deleteConfirmMessage', { title: displayTitle })}
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
