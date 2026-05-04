import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Tag, Button, Space, Descriptions, Typography, message, Spin, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchFaq, deleteFaq } from '@/store/faqsSlice';

const { Title, Paragraph } = Typography;

const FaqDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { currentFaq, loading, deleting } = useSelector((state) => state.faqs);

  useEffect(() => {
    // Always fetch from API when accessed via URL
    if (id) {
      dispatch(fetchFaq(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/faqs/${id}/edit`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('faqs.deleteConfirm', { title: currentFaq?.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteFaq(id)).unwrap();
          message.success(t('faqs.deleteSuccess'));
          navigate('/faqs');
        } catch (error) {
          message.error(t('faqs.deleteError'));
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentFaq) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>{t('faqs.notFound')}</Title>
            <Button type="primary" onClick={() => navigate('/faqs')}>
              {t('faqs.backToList')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getLanguageLabel = (lang) => {
    const labels = {
      ar: 'العربية',
      en: 'English',
      fr: 'Français',
    };
    return labels[lang] || lang;
  };

  const getLanguageColor = (lang) => {
    const colors = {
      ar: 'blue',
      en: 'orange',
      fr: 'green',
    };
    return colors[lang] || 'default';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/faqs')}
            >
              {t('common.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {t('faqs.details')}
            </Title>
          </div>
          
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              {t('common.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
            >
              {t('common.delete')}
            </Button>
          </Space>
        </div>

        <div style={{ background: '#f5f5f5', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: '0 0 16px 0' }}>
            {currentFaq.title}
          </Title>
          
          <div style={{ marginBottom: '16px' }}>
            <Space size="middle">
              <Tag color={getLanguageColor(currentFaq.lang)}>
                {getLanguageLabel(currentFaq.lang)}
              </Tag>
              <Tag color={currentFaq.isActive ? 'success' : 'default'}>
                {currentFaq.isActive ? t('common.active') : t('common.inactive')}
              </Tag>
            </Space>
          </div>

          <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
            {currentFaq.description}
          </Paragraph>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={t('faqs.title')}>
            {currentFaq.title}
          </Descriptions.Item>
          <Descriptions.Item label={t('faqs.description')}>
            {currentFaq.description}
          </Descriptions.Item>
          <Descriptions.Item label={t('faqs.language')}>
            <Tag color={getLanguageColor(currentFaq.lang)}>
              {getLanguageLabel(currentFaq.lang)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('faqs.status')}>
            <Tag color={currentFaq.isActive ? 'success' : 'default'}>
              {currentFaq.isActive ? t('common.active') : t('common.inactive')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('faqs.publishedAt')}>
            {new Date(currentFaq.publishedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default FaqDetail;
