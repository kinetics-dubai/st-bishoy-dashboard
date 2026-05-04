import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Modal, Space, Table, Typography, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, EyeOutlined, GlobalOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '@/components/CenteredLoader';
import {
  clearBookTranslations,
  clearCurrentBook,
  deleteBookTranslation,
  fetchBook,
  fetchBookTranslations,
} from '@/store/booksSlice';

const { Text } = Typography;

const BookTranslationsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const {
    currentBook,
    loading: bookLoading,
    bookTranslations,
    bookTranslationsLoading,
    deletingBookTranslation,
  } = useSelector((state) => state.books);

  useEffect(() => {
    if (!id) return;

    dispatch(fetchBook(id));
    dispatch(fetchBookTranslations(id));

    return () => {
      dispatch(clearCurrentBook());
      dispatch(clearBookTranslations());
    };
  }, [dispatch, id]);

  const getLanguageLabel = (record) => {
    const language = record?.language;
    if (!language) return t('common.notAvailable');
    return language.abbr ? `${language.name} (${language.abbr})` : language.name;
  };

  const handleDelete = (translation) => {
    Modal.confirm({
      title: t('translations.deleteConfirm'),
      content: t('translations.deleteConfirmMessage', {
        title: translation?.title || t('common.notAvailable'),
        language: getLanguageLabel(translation),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteBookTranslation(translation.id)).unwrap();
          message.success(t('translations.deleteSuccess'));
          dispatch(fetchBookTranslations(id));
        } catch (error) {
          message.error(t('translations.deleteError'));
        }
      },
    });
  };

  const columns = [
    {
      title: t('translations.language'),
      dataIndex: 'language',
      key: 'language',
      render: (_, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#5C1A1B' }} />
          <Text strong>{getLanguageLabel(record)}</Text>
        </Space>
      ),
    },
    {
      title: t('translations.translationTitle'),
      dataIndex: 'title',
      key: 'title',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('translations.publishedAt'),
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (value) => (value ? new Date(value).toLocaleString() : t('common.notAvailable')),
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
            onClick={() => navigate(`/bible/books/${id}/translations/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/bible/books/${id}/translations/${record.id}/edit`)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deletingBookTranslation}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  if (bookLoading && !currentBook) {
    return (
      <div style={{ padding: '24px' }}>
        <CenteredLoader minHeight="calc(100vh - 220px)" />
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('bible.bookNotFound')} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>{currentBook.title}</h2>
            <Text type="secondary">{t('bible.bookTranslations')}</Text>
          </div>

          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/bible/books/${id}`)}>
              {t('common.back')}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/bible/books/${id}/translations/create`)}
              style={{ background: '#5C1A1B', border: 'none' }}
            >
              {t('translations.addTranslation')}
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={bookTranslations || []}
          loading={bookTranslationsLoading}
          pagination={false}
          locale={{ emptyText: t('translations.noTranslations') }}
        />
      </Card>
    </div>
  );
};

export default BookTranslationsList;
