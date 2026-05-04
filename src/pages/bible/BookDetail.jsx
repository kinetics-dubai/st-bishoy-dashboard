import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, Space, Tag, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, EyeOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchBook, deleteBook, deleteChapter } from '@/store/booksSlice';
import CenteredLoader from '@/components/CenteredLoader';

const BookDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { currentBook, loading, deleting } = useSelector((state) => state.books);

  useEffect(() => {
    if (id) {
      dispatch(fetchBook(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/bible/books/${id}/edit`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('bible.deleteConfirm', { title: currentBook?.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteBook(id)).unwrap();
          message.success(t('bible.deleteSuccess'));
          navigate('/bible/books');
        } catch (error) {
          message.error(t('bible.deleteError'));
        }
      },
    });
  };

  const handleDeleteChapter = (chapter) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('bible.deleteChapterConfirm', { title: chapter.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteChapter(chapter.id)).unwrap();
          message.success(t('bible.deleteChapterSuccess'));
        } catch (error) {
          message.error(t('bible.deleteChapterError'));
        }
      },
    });
  };

  const getTestamentColor = (testament) => {
    return testament === 'old' ? 'default' : 'blue';
  };

  const bookColumns = [
    {
      title: t('bible.chapter'),
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.is_translation && (
            <Tag color="green" style={{ marginLeft: '8px' }}>
              {t('bible.translation')}
            </Tag>
          )}
        </div>
      ),
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
            onClick={() => navigate(`/bible/chapters/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/bible/chapters/${record.id}/edit`)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChapter(record)}
            loading={deleting}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>{t('bible.bookNotFound')}</h3>
            <Button type="primary" onClick={() => navigate('/bible/books')}>
              {t('bible.backToBooks')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BookOutlined style={{ color: '#5C1A1B' }} />
            <div>
              <h2 style={{ margin: 0, marginBottom: '4px' }}>{currentBook.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color={getTestamentColor(currentBook.testament)}>
                  {t(`bible.testaments.${currentBook.testament}`)}
                </Tag>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button
              icon={<GlobalOutlined />}
              onClick={() => navigate(`/bible/books/${id}/translations`)}
            >
              {t('translations.viewTranslations')}
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              style={{ background: '#5C1A1B', border: 'none' }}
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
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' , marginBottom:'15px'}}>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/bible/chapters/create?book_id=${id}`)}
            style={{ borderColor: '#5C1A1B', color: '#5C1A1B' }}
          >
            {t('bible.createChapter')}
          </Button>
        </div>

        <Table
          columns={bookColumns}
          dataSource={currentBook.chapters || []}
          rowKey="id"
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Card>
    </div>
  );
};

export default BookDetail;
