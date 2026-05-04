import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Switch, Button, Card, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createFaq, updateFaq, fetchFaq } from '@/store/faqsSlice';

const { TextArea } = Input;
const { Option } = Select;

const FaqForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = !!id;
  const { currentFaq, loading, creating, updating } = useSelector((state) => state.faqs);

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchFaq(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentFaq) {
      form.setFieldsValue({
        title: currentFaq.title,
        description: currentFaq.description,
        lang: currentFaq.lang,
        isActive: currentFaq.isActive,
      });
    }
  }, [currentFaq, form, isEditing]);

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        await dispatch(updateFaq({ id, data: values })).unwrap();
        message.success(t('faqs.updateSuccess'));
      } else {
        await dispatch(createFaq(values)).unwrap();
        message.success(t('faqs.createSuccess'));
      }
      navigate('/faqs');
    } catch (error) {
      message.error(isEditing ? t('faqs.updateError') : t('faqs.createError'));
    }
  };

  const handleCancel = () => {
    navigate('/faqs');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            {t('common.back')}
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEditing ? t('faqs.edit') : t('faqs.create')}
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            lang: 'ar',
            isActive: true,
          }}
        >
          <Form.Item
            name="title"
            label={t('faqs.title')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 3, message: t('validation.minLength', { min: 3 }) },
              { max: 200, message: t('validation.maxLength', { max: 200 }) },
            ]}
          >
            <Input
              placeholder={t('faqs.titlePlaceholder')}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('faqs.description')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 10, message: t('validation.minLength', { min: 10 }) },
              { max: 1000, message: t('validation.maxLength', { max: 1000 }) },
            ]}
          >
            <TextArea
              placeholder={t('faqs.descriptionPlaceholder')}
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item
              name="lang"
              label={t('faqs.language')}
              rules={[{ required: true, message: t('validation.required') }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder={t('faqs.selectLanguage')}>
                <Option value="ar">العربية</Option>
                <Option value="en">English</Option>
                <Option value="fr">Français</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="isActive"
              label={t('faqs.status')}
              valuePropName="checked"
              style={{ flex: 1, minWidth: 200 }}
            >
              <Switch
                checkedChildren={t('common.active')}
                unCheckedChildren={t('common.inactive')}
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: '32px' }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={creating || updating}
              >
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FaqForm;
