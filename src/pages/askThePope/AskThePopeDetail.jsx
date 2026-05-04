import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Modal, Space, Spin, Tag, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  fetchAskThePopeQuestion,
  deleteAskThePopeQuestion,
} from '@/store/askThePopeSlice';

const { Paragraph, Title } = Typography;

const AskThePopeDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { currentQuestion, loading, deleting } = useSelector((state) => state.askThePope);

  useEffect(() => {
    if (id) {
      dispatch(fetchAskThePopeQuestion(id));
    }
  }, [dispatch, id]);

  const handleDelete = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('askThePope.deleteConfirm', { name: currentQuestion?.name }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteAskThePopeQuestion(id)).unwrap();
          message.success(t('askThePope.deleteSuccess'));
          navigate('/ask-the-pope');
        } catch (error) {
          message.error(t('askThePope.deleteError'));
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

  if (!currentQuestion) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>{t('askThePope.notFound')}</Title>
            <Button type="primary" onClick={() => navigate('/ask-the-pope')}>
              {t('askThePope.backToList')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/ask-the-pope')}>
              {t('common.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {t('askThePope.details')}
            </Title>
          </div>

          <Space>
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
          <Title level={4}>{t('askThePope.question')}</Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: 0 }}>
            {currentQuestion.question}
          </Paragraph>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={t('askThePope.name')}>
            {currentQuestion.name || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('askThePope.phoneNumber')}>
            {currentQuestion.phone_number || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('askThePope.email')}>
            {currentQuestion.email || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('askThePope.public')}>
            <Tag color={currentQuestion.public ? 'success' : 'default'}>
              {currentQuestion.public ? t('common.yes') : t('common.no')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('askThePope.question')}>
            {currentQuestion.question}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default AskThePopeDetail;
