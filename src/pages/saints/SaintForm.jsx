import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Space,
  Switch,
  message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  clearCurrentSaint,
  createSaint,
  fetchSaint,
  updateSaint,
} from '@/store/saintsSlice';

const { TextArea } = Input;

const SaintForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = Boolean(id);
  const { currentSaint, loading, creating, updating } = useSelector((state) => state.saints);

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchSaint(id));
    }

    return () => {
      dispatch(clearCurrentSaint());
    };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (!isEditing || !currentSaint) return;

    form.setFieldsValue({
      name: currentSaint?.name || '',
      slug: currentSaint?.slug || '',
      image: currentSaint?.image || '',
      saint_day: currentSaint?.saint_day ? dayjs(currentSaint.saint_day) : null,
      subtitle: currentSaint?.subtitle || '',
      biography: currentSaint?.biography || '',
      excerpt: currentSaint?.excerpt || '',
      isActive: currentSaint?.isActive ?? true,
    });
  }, [currentSaint, form, isEditing]);

  const handleSubmit = async (values) => {
    const basePayload = {
      name: values.name,
      slug: values.slug,
      image: values.image || null,
      subtitle: values.subtitle || null,
      biography: values.biography || null,
      excerpt: values.excerpt || null,
      isActive: values.isActive ?? true,
    };

    try {
      if (isEditing) {
        await dispatch(updateSaint({ id, data: basePayload })).unwrap();
        message.success(t('saints.updateSuccess'));
        navigate('/saints');
      } else {
        const payload = {
          ...basePayload,
          saint_day: values.saint_day ? values.saint_day.format('YYYY-MM-DD') : null,
        };
        await dispatch(createSaint(payload)).unwrap();
        message.success(t('saints.createSuccess'));
        navigate('/saints');
      }
    } catch (error) {
      message.error(isEditing ? t('saints.updateError') : t('saints.createError'));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card loading={loading}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/saints')}>
            {t('common.back')}
          </Button>
          <h2 style={{ margin: 0 }}>{isEditing ? t('saints.edit') : t('saints.create')}</h2>
        </div>

        {!isEditing ? (
          <Alert
            type="info"
            showIcon
            message={t('saints.createDefaultArabicNotice')}
            style={{ marginBottom: '24px' }}
          />
        ) : null}

        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <Form.Item
              name="name"
              label={t('saints.name')}
              rules={[
                { required: true, message: t('validation.required') },
                { min: 3, message: t('validation.minLength', { min: 3 }) },
              ]}
            >
              <Input placeholder={t('saints.namePlaceholder')} />
            </Form.Item>

            <Form.Item
              name="slug"
              label={t('saints.slug')}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <Input placeholder={t('saints.slugPlaceholder')} />
            </Form.Item>

            <Form.Item name="saint_day" label={t('saints.saintDay')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item name="image" label={t('saints.image')}>
              <Input placeholder={t('saints.imagePlaceholder')} />
            </Form.Item>
          </div>

          <Form.Item name="subtitle" label={t('saints.subtitle')}>
            <Input placeholder={t('saints.subtitlePlaceholder')} />
          </Form.Item>

          <Form.Item name="excerpt" label={t('saints.excerpt')}>
            <TextArea rows={3} placeholder={t('saints.excerptPlaceholder')} />
          </Form.Item>

          <Form.Item name="biography" label={t('saints.biography')}>
            <TextArea rows={6} placeholder={t('saints.biographyPlaceholder')} />
          </Form.Item>

          <Form.Item name="isActive" label={t('common.status')} valuePropName="checked">
            <Switch
              checkedChildren={t('common.active')}
              unCheckedChildren={t('common.inactive')}
            />
          </Form.Item>

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
              <Button onClick={() => navigate('/saints')}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SaintForm;
