import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, BookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createChapter, updateChapter, fetchChapter } from '@/store/booksSlice';

const ChapterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const isEditing = !!id;
  const { currentChapter, loading, creating, updating } = useSelector((state) => state.books);
  const bookId = searchParams.get('book_id') || (isEditing && currentChapter?.book_id);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchChapter(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentChapter) {
      form.setFieldsValue({
        title: currentChapter.title,
        content: currentChapter.content,
      });
    } else if (!isEditing && bookId) {
      form.setFieldsValue({
        book_id: bookId,
      });
    }
  }, [currentChapter, form, isEditing, bookId]);

  const handleSubmit = async (values) => {
    try {
      const chapterData = {
        ...values,
        book_id: bookId
      };
      
      if (isEditing) {
        await dispatch(updateChapter({ id, data: chapterData })).unwrap();
        message.success(t('bible.updateChapterSuccess'));
      } else {
        await dispatch(createChapter(chapterData)).unwrap();
        message.success(t('bible.createChapterSuccess'));
      }
      navigate(`/bible/books/${bookId}`);
    } catch (error) {
      message.error(isEditing ? t('bible.updateChapterError') : t('bible.createChapterError'));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BookOutlined style={{ color: '#5C1A1B' }} />
            <h2 style={{ margin: 0 }}>
              {isEditing ? t('bible.editChapter') : t('bible.createChapter')}
            </h2>
          </div>
          
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/bible/books/${bookId}`)}
          >
            {t('common.back')}
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '800px' }}
        >
          <Form.Item
            label={t('bible.title')}
            name="title"
            rules={[{ required: true, message: t('bible.titleRequired') }]}
          >
            <Input placeholder={t('bible.chapterTitlePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('bible.content')}
            name="content"
            rules={[{ required: true, message: t('bible.contentRequired') }]}
          >
            <Input.TextArea 
              rows={8}
              placeholder={t('bible.chapterContentPlaceholder')}
            />
          </Form.Item>


          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={creating || updating}
                style={{ background: '#5C1A1B', border: 'none' }}
              >
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button
                type="default"
                onClick={() => navigate(`/bible/books/${currentChapter?.book_id || '1'}`)}
              >
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChapterForm;
