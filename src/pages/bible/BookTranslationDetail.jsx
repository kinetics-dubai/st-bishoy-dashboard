import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Empty, Modal, Space, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '@/components/CenteredLoader';
import {
  clearCurrentBookTranslation,
  deleteBookTranslation,
  fetchBookTranslation,
} from '@/store/booksSlice';

const BookTranslationDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, translationId } = useParams();
  const { t } = useTranslation();

  const { currentBookTranslation, bookTranslationsLoading, deletingBookTranslation } = useSelector((state) => state.books);

  useEffect(() => {
    if (!translationId) return;

    dispatch(fetchBookTranslation(translationId));

    return () => {
      dispatch(clearCurrentBookTranslation());
    };
  }, [dispatch, translationId]);

  const handleDelete = () => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('translations.deleteConfirmMessage', {
        title: currentBookTranslation?.title || t('common.notAvailable'),
        language: currentBookTranslation?.language?.name || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteBookTranslation(translationId)).unwrap();
          message.success(t('translations.deleteSuccess'));
          navigate(`/bible/books/${id}/translations`);
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  if (bookTranslationsLoading && !currentBookTranslation) {
    return (
      <div style={{ padding: '24px' }}>
        <CenteredLoader minHeight="calc(100vh - 220px)" />
      </div>
    );
  }

  if (!currentBookTranslation) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('bible.bookTranslationNotFound')} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>{currentBookTranslation.title}</h2>
          </div>

          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/bible/books/${id}/translations`)}>
              {t('common.back')}
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/bible/books/${id}/translations/${translationId}/edit`)}
              style={{ background: '#5C1A1B', border: 'none' }}
            >
              {t('common.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deletingBookTranslation}
            >
              {t('common.delete')}
            </Button>
          </Space>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('translations.translationTitle')}>
            {currentBookTranslation.title || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('translations.language')}>
            <Space>
              <GlobalOutlined style={{ color: '#5C1A1B' }} />
              <span>{currentBookTranslation.language?.name || t('common.notAvailable')}</span>
              {currentBookTranslation.language?.abbr ? <span>({currentBookTranslation.language.abbr})</span> : null}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={t('bible.bookId')}>
            {currentBookTranslation.book_id || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('translations.publishedAt')}>
            {currentBookTranslation.publishedAt ? new Date(currentBookTranslation.publishedAt).toLocaleString() : t('common.notAvailable')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default BookTranslationDetail;
