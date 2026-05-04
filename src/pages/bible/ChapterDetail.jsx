import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Space, Tag, message, Modal, Table, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchChapter,
  deleteChapter,
  fetchVerseGroups,
  deleteVerseGroup,
} from '@/store/booksSlice';
import CenteredLoader from '@/components/CenteredLoader';

const { Text } = Typography;

const ChapterDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const {
    currentChapter,
    loading,
    deletingChapter,
    verseGroups,
    verseGroupsLoading,
    deletingVerseGroup,
  } = useSelector((state) => state.books);

  useEffect(() => {
    if (id) {
      dispatch(fetchChapter(id));
      dispatch(fetchVerseGroups({ chapter_id: id }));
    }
  }, [dispatch, id]);

  const handleEditChapter = () => {
    navigate(`/bible/chapters/${id}/edit`);
  };

  const handleDeleteChapter = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('bible.deleteChapterConfirm', { title: currentChapter?.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteChapter(id)).unwrap();
          message.success(t('bible.deleteChapterSuccess'));
          navigate(`/bible/books/${currentChapter?.book_id || '1'}`);
        } catch (error) {
          message.error(t('bible.deleteChapterError'));
        }
      },
    });
  };

  const handleDeleteVerseGroup = (verseGroup) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('bible.deleteVerseGroupConfirm', {
        range: `${verseGroup.start_verse}-${verseGroup.end_verse}`,
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteVerseGroup(verseGroup.id)).unwrap();
          message.success(t('bible.deleteVerseGroupSuccess'));
        } catch (error) {
          message.error(t('bible.deleteVerseGroupError'));
        }
      },
    });
  };

  const hasTranslations = (record) => {
    if (Array.isArray(record.translations)) return record.translations.length > 0;
    if (typeof record.translations_count === 'number') return record.translations_count > 0;
    return Boolean(record.has_translations);
  };

  const verseGroupColumns = [
    {
      title: t('bible.verseRange'),
      key: 'verseRange',
      width: 130,
      render: (_, record) => `${record.start_verse} - ${record.end_verse}`,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/bible/verse-groups/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/bible/verse-groups/${record.id}/edit`)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVerseGroup(record)}
            loading={deletingVerseGroup}
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

  if (!currentChapter) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>{t('bible.chapterNotFound')}</h3>
            <Button type="primary" onClick={() => navigate('/bible/books')}>
              {t('bible.backToBooks')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflowX: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0 }}>{currentChapter.title}</h2>
            <Text type="secondary">{currentChapter.book?.title}</Text>
          </div>

          <Space wrap>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/bible/books/${currentChapter.book_id}`)}
            >
              {t('common.back')}
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditChapter}
              style={{ background: '#5C1A1B', border: 'none' }}
            >
              {t('common.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteChapter}
              loading={deletingChapter}
            >
              {t('common.delete')}
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>{t('bible.verseGroups')}</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#5C1A1B', border: 'none' }}
            onClick={() => navigate(`/bible/verse-groups/create?chapter_id=${id}`)}
          >
            {t('bible.createVerseGroup')}
          </Button>
        </div>

        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table
            rowKey="id"
            columns={verseGroupColumns}
            dataSource={verseGroups || []}
            loading={verseGroupsLoading}
            scroll={{ x: 'max-content' }}
            pagination={false}
            locale={{
              emptyText: t('bible.noVerseGroups'),
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ChapterDetail;
