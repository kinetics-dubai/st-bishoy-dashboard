import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchBooks } from '@/store/booksSlice';
import apiService from '@/services/apiService';
import {
  clearCurrentSynaxarium,
  clearSynaxariumReadings,
  createSynaxariumReading,
  deleteSynaxarium,
  deleteSynaxariumReading,
  fetchSynaxarium,
  fetchSynaxariumReadings,
  updateSynaxariumReading,
} from '@/store/synaxariumSlice';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const READING_TYPES = [
  'PAULINE',
  'CATHOLIC',
  'PRAXIS',
  'PSALM',
  'GOSPEL',
  'SYNAXARIUM',
];

const formatCopticDate = (value, locale) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  try {
    const formatterLocale = locale === 'ar' ? 'ar-u-nu-arab' : 'en';
    const formatter = new Intl.DateTimeFormat(formatterLocale, {
      calendar: 'coptic',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'era')
      .map((part) => part.value)
      .join('')
      .replace(/\s+,/g, ',')
      .trim();
  } catch {
    return null;
  }
};

const normalizeChapterOption = (item = {}, t) => {
  const base = item.base || {};
  const translation = item.translation || {};
  const chapterId = base.id ?? translation.chapter_id ?? translation.id ?? null;

  return {
    value: chapterId,
    label: translation.title || `${t('synaxarium.chapter')} #${chapterId}`,
    bookId: base.book_id ?? base.book?.id ?? null,
  };
};

const formatEventLabel = (eventKey = '') =>
  eventKey
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const SynaxariumDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();

  const {
    currentSynaxarium,
    readings,
    loading,
    readingsLoading,
    deleting,
    creatingReading,
    updatingReading,
    deletingReading,
  } = useSelector((state) => state.synaxarium);
  const { books, loading: booksLoading } = useSelector((state) => state.books);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewReading, setPreviewReading] = useState(null);
  const [editingReading, setEditingReading] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [chaptersByBook, setChaptersByBook] = useState({});
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const copticDate = useMemo(
    () => formatCopticDate(currentSynaxarium?.synaxarium_date, i18n.language),
    [currentSynaxarium?.synaxarium_date, i18n.language]
  );

  const synaxariumEvents = currentSynaxarium?.events || [];

  useEffect(() => {
    if (!id) return undefined;

    dispatch(fetchSynaxarium(id));
    dispatch(fetchSynaxariumReadings(id));

    if (!books?.length) {
      dispatch(fetchBooks({ limit: 1000 }));
    }

    return () => {
      dispatch(clearCurrentSynaxarium());
      dispatch(clearSynaxariumReadings());
    };
  }, [books?.length, dispatch, id]);

  const bookOptions = useMemo(
    () =>
      (books || []).map((book) => ({
        value: book.id,
        label: book.title || `${t('synaxarium.book')} #${book.id}`,
      })),
    [books, t]
  );

  const booksMap = useMemo(
    () =>
      (books || []).reduce((accumulator, book) => {
        accumulator[String(book.id)] = book.title || `${t('synaxarium.book')} #${book.id}`;
        return accumulator;
      }, {}),
    [books, t]
  );

  const chapterOptions = useMemo(
    () => chaptersByBook[String(selectedBookId)] || [],
    [chaptersByBook, selectedBookId]
  );

  const chaptersMap = useMemo(
    () =>
      Object.values(chaptersByBook).reduce((accumulator, chapterList) => {
        chapterList.forEach((chapter) => {
          accumulator[String(chapter.value)] = chapter.label;
        });
        return accumulator;
      }, {}),
    [chaptersByBook]
  );

  const loadChapters = async (bookId) => {
    if (!bookId || chaptersByBook[String(bookId)]) {
      return;
    }

    setChaptersLoading(true);

    try {
      const response = await apiService.get(`/chapters?book_id=${bookId}`);
      const chapterList = (response.data?.data || []).map((item) => normalizeChapterOption(item, t));

      setChaptersByBook((current) => ({
        ...current,
        [String(bookId)]: chapterList,
      }));
    } catch (error) {
      message.error(t('synaxarium.chapterLoadError'));
    } finally {
      setChaptersLoading(false);
    }
  };

  useEffect(() => {
    const relatedBookIds = Array.from(
      new Set(
        (readings || [])
          .map((reading) => reading.book_reference ?? reading.chapter?.book_id ?? null)
          .filter(Boolean)
      )
    );

    relatedBookIds.forEach((bookId) => {
      if (!chaptersByBook[String(bookId)]) {
        loadChapters(bookId);
      }
    });
  }, [readings]);

  const openCreateModal = () => {
    setEditingReading(null);
    setSelectedBookId(null);
    form.setFieldsValue({
      title: '',
      reading_type: undefined,
      book_reference: null,
      chapter_id: null,
      verse_range: '',
      content: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (reading) => {
    const bookId = reading?.book_reference ?? reading?.chapter?.book_id ?? null;

    setEditingReading(reading);
    setSelectedBookId(bookId);
    form.setFieldsValue({
      title: reading?.title || '',
      reading_type: reading?.reading_type || undefined,
      book_reference: bookId,
      chapter_id: reading?.chapter_id ?? null,
      verse_range: reading?.verse_range || '',
      content: reading?.content || '',
      isActive: reading?.isActive ?? true,
    });

    if (bookId) {
      loadChapters(bookId);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReading(null);
    setSelectedBookId(null);
    form.resetFields();
  };

  const handleSaveReading = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title.trim(),
        reading_type: values.reading_type,
        synaxarium_id: Number(id),
        chapter_id: values.chapter_id ?? null,
        verse_range: values.verse_range?.trim() || null,
        content: values.content?.trim() || null,
        isActive: values.isActive ?? true,
      };

      if (editingReading) {
        await dispatch(
          updateSynaxariumReading({
            id: editingReading.id,
            data: payload,
          })
        ).unwrap();
        message.success(t('synaxarium.readingUpdateSuccess'));
      } else {
        await dispatch(createSynaxariumReading(payload)).unwrap();
        message.success(t('synaxarium.readingCreateSuccess'));
      }

      closeModal();
      dispatch(fetchSynaxariumReadings(id));
    } catch (error) {
      if (error?.errorFields) return;
      message.error(editingReading ? t('synaxarium.readingUpdateError') : t('synaxarium.readingCreateError'));
    }
  };

  const handleDeleteSynaxarium = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('synaxarium.deleteConfirm', {
        date: currentSynaxarium?.synaxarium_date || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteSynaxarium(id)).unwrap();
          message.success(t('synaxarium.deleteSuccess'));
          navigate('/synaxarium');
        } catch (error) {
          message.error(t('synaxarium.deleteError'));
        }
      },
    });
  };

  const handleDeleteReading = (reading) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('synaxarium.deleteReadingConfirm', {
        title: reading?.title || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteSynaxariumReading(reading.id)).unwrap();
          message.success(t('synaxarium.readingDeleteSuccess'));
        } catch (error) {
          message.error(t('synaxarium.readingDeleteError'));
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t('synaxarium.readingTitle'),
        dataIndex: 'title',
        key: 'title',
        render: (value) => <strong>{value || t('common.notAvailable')}</strong>,
      },
      {
        title: t('synaxarium.readingType'),
        dataIndex: 'reading_type',
        key: 'reading_type',
        width: 150,
        render: (value) => (
          <Tag color={value === 'SYNAXARIUM' ? 'gold' : 'blue'}>
            {t(`synaxarium.readingTypes.${value}`, { defaultValue: value || t('common.notAvailable') })}
          </Tag>
        ),
      },
      {
        title: t('synaxarium.chapterViewName'),
        dataIndex: 'chapter_id',
        key: 'chapter_id',
        render: (value) => (value ? chaptersMap[String(value)] || `#${value}` : t('common.notAvailable')),
      },
      {
        title: t('synaxarium.verseRange'),
        dataIndex: 'verse_range',
        key: 'verse_range',
        render: (value) => value || t('common.notAvailable'),
      },
      {
        title: t('common.status'),
        dataIndex: 'isActive',
        key: 'isActive',
        width: 120,
        render: (isActive) => (
          <Tag color={isActive ? 'success' : 'default'}>
            {isActive ? t('common.active') : t('common.inactive')}
          </Tag>
        ),
      },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 180,
        render: (_, record) => (
          <Space size="small">
            <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewReading(record)} />
            <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingReading}
              onClick={() => handleDeleteReading(record)}
            />
          </Space>
        ),
      },
    ],
    [booksMap, chaptersMap, deletingReading, t]
  );

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentSynaxarium) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('synaxarium.notFound')} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <Space align="center" style={{ marginBottom: '16px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/synaxarium')}>
                  {t('common.back')}
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  {currentSynaxarium?.synaxarium_date || t('synaxarium.title')}
                </Title>
              </Space>

              <Space wrap size={[8, 8]} style={{ marginBottom: '16px' }}>
                <Tag color={currentSynaxarium?.isActive ? 'success' : 'default'}>
                  {currentSynaxarium?.isActive ? t('common.active') : t('common.inactive')}
                </Tag>
                <Tag color="processing">
                  {t('synaxarium.readingsCount', { count: readings.length })}
                </Tag>
              </Space>

              <Paragraph type="secondary" style={{ marginBottom: '12px' }}>
                {t('synaxarium.detailsSubtitle')}
              </Paragraph>

              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t('synaxarium.id')}>
                  {currentSynaxarium?.id || t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('synaxarium.date')}>
                  {currentSynaxarium?.synaxarium_date || t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('synaxarium.copticDate')}>
                  {copticDate || t('common.notAvailable')}
                </Descriptions.Item>
                <Descriptions.Item label={t('synaxarium.events')}>
                  {synaxariumEvents.length ? (
                    <Space wrap size={[8, 8]}>
                      {synaxariumEvents.map((event) => (
                        <Tag key={event} color="purple">
                          {t(`synaxarium.eventsList.${event}`, {
                            defaultValue: formatEventLabel(event),
                          })}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    t('synaxarium.noEvents')
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('common.status')}>
                  {currentSynaxarium?.isActive ? t('common.active') : t('common.inactive')}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Space>
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/synaxarium/${id}/edit`)}>
                {t('common.edit')}
              </Button>
              <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={handleDeleteSynaxarium}>
                {t('common.delete')}
              </Button>
            </Space>
          </div>
        </Card>

        <Card
          title={t('synaxarium.readings')}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('synaxarium.addReading')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            loading={readingsLoading}
            columns={columns}
            dataSource={readings}
            pagination={false}
            locale={{ emptyText: t('synaxarium.noReadings') }}
          />
        </Card>
      </Space>

      <Modal
        open={isModalOpen}
        title={editingReading ? t('synaxarium.editReading') : t('synaxarium.addReading')}
        onCancel={closeModal}
        onOk={handleSaveReading}
        confirmLoading={creatingReading || updatingReading}
        okText={editingReading ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item
            name="title"
            label={t('synaxarium.readingTitle')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('synaxarium.readingTitlePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="reading_type"
            label={t('synaxarium.readingType')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select
              placeholder={t('synaxarium.selectReadingType')}
              options={READING_TYPES.map((type) => ({
                value: type,
                label: t(`synaxarium.readingTypes.${type}`, { defaultValue: type }),
              }))}
            />
          </Form.Item>

          <Form.Item name="book_reference" label={t('synaxarium.book')}>
            <Select
              allowClear
              showSearch
              loading={booksLoading}
              options={bookOptions}
              placeholder={t('synaxarium.selectBook')}
              optionFilterProp="label"
              onChange={(value) => {
                setSelectedBookId(value ?? null);
                form.setFieldValue('chapter_id', null);

                if (value) {
                  loadChapters(value);
                }
              }}
            />
          </Form.Item>

          <Form.Item name="chapter_id" label={t('synaxarium.chapterViewName')}>
            <Select
              allowClear
              showSearch
              disabled={!selectedBookId}
              loading={chaptersLoading}
              options={chapterOptions}
              placeholder={t('synaxarium.selectChapter')}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="verse_range" label={t('synaxarium.verseRange')}>
            <Input placeholder={t('synaxarium.verseRangePlaceholder')} />
          </Form.Item>

          <Form.Item name="content" label={t('synaxarium.content')}>
            <TextArea rows={5} placeholder={t('synaxarium.contentPlaceholder')} />
          </Form.Item>

          <Form.Item name="isActive" label={t('common.status')} valuePropName="checked">
            <Switch checkedChildren={t('common.active')} unCheckedChildren={t('common.inactive')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={Boolean(previewReading)}
        title={previewReading?.title || t('synaxarium.readingPreview')}
        onCancel={() => setPreviewReading(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewReading(null)}>
            {t('common.close')}
          </Button>,
        ]}
      >
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label={t('synaxarium.readingType')}>
            {previewReading
              ? t(`synaxarium.readingTypes.${previewReading.reading_type}`, {
                  defaultValue: previewReading.reading_type,
                })
              : t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('synaxarium.book')}>
            {previewReading?.book_reference
              ? booksMap[String(previewReading.book_reference)] || `#${previewReading.book_reference}`
              : t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('synaxarium.chapterViewName')}>
            {previewReading?.chapter_id
              ? chaptersMap[String(previewReading.chapter_id)] || `#${previewReading.chapter_id}`
              : t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('synaxarium.verseRange')}>
            {previewReading?.verse_range || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.status')}>
            {previewReading?.isActive ? t('common.active') : t('common.inactive')}
          </Descriptions.Item>
          <Descriptions.Item label={t('synaxarium.content')}>
            <Text>{previewReading?.content || t('common.notAvailable')}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default SynaxariumDetail;
