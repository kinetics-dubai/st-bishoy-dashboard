import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, BookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createBook, updateBook, fetchBook, clearCurrentBook } from '@/store/booksSlice';
import CenteredLoader from '@/components/CenteredLoader';

const { Option } = Select;

const BookForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = !!id;
  const { currentBook, loading, creating, updating } = useSelector((state) => state.books);
  const isCurrentBookReady = !isEditing || String(currentBook?.id) === String(id);

  useEffect(() => {
    if (isEditing) {
      form.resetFields();
      dispatch(clearCurrentBook());
      dispatch(fetchBook(id));
    }
  }, [dispatch, form, id, isEditing]);

  useEffect(() => {
    if (isEditing && isCurrentBookReady && currentBook) {
      form.setFieldsValue({
        title: currentBook.title,
        testament: currentBook.testament,
      });
    } else if (!isEditing) {
      form.resetFields();
    }
  }, [currentBook, form, isCurrentBookReady, isEditing]);

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        await dispatch(updateBook({ id, data: values })).unwrap();
        message.success(t('bible.updateSuccess'));
      } else {
        await dispatch(createBook(values)).unwrap();
        message.success(t('bible.createSuccess'));
      }
      navigate('/bible');
    } catch (error) {
      message.error(isEditing ? t('bible.updateError') : t('bible.createError'));
    }
  };

  if (isEditing && (loading || !isCurrentBookReady)) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <CenteredLoader minHeight="calc(100vh - 260px)" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BookOutlined style={{ color: '#5C1A1B' }} />
            <h2 style={{ margin: 0 }}>
              {isEditing ? t('bible.editBook') : t('bible.createBook')}
            </h2>
          </div>
          
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/bible/books')}
          >
            {t('common.back')}
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '600px' }}
        >
          <Form.Item
            label={t('bible.title')}
            name="title"
            rules={[{ required: true, message: t('bible.titleRequired') }]}
          >
            <Input
              placeholder={t('bible.titlePlaceholder')}
              disabled={isEditing}
            />
          </Form.Item>

          <Form.Item
            label={t('bible.testament')}
            name="testament"
            rules={[{ required: true, message: t('bible.testamentRequired') }]}
          >
            <Select placeholder={t('bible.selectTestament')}>
              <Option value="old">{t('bible.oldTestament')}</Option>
              <Option value="new">{t('bible.newTestament')}</Option>
            </Select>
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
                onClick={() => navigate('/bible')}
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

export default BookForm;
