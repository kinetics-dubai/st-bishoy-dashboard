import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Space,
  Switch,
  message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  clearCurrentSynaxarium,
  createSynaxarium,
  fetchSynaxarium,
  updateSynaxarium,
} from '@/store/synaxariumSlice';

const SynaxariumForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = Boolean(id);
  const { currentSynaxarium, loading, creating, updating } = useSelector((state) => state.synaxarium);

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchSynaxarium(id));
    }

    return () => {
      dispatch(clearCurrentSynaxarium());
    };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (!isEditing || !currentSynaxarium) return;

    form.setFieldsValue({
      synaxarium_date: currentSynaxarium.synaxarium_date
        ? dayjs(currentSynaxarium.synaxarium_date)
        : null,
      isActive: currentSynaxarium.isActive ?? true,
    });
  }, [currentSynaxarium, form, isEditing]);

  const handleSubmit = async (values) => {
    const payload = {
      synaxarium_date: values.synaxarium_date.format('YYYY-MM-DD'),
      isActive: values.isActive ?? true,
    };

    try {
      if (isEditing) {
        await dispatch(updateSynaxarium({ id, data: payload })).unwrap();
        message.success(t('synaxarium.updateSuccess'));
      } else {
        await dispatch(createSynaxarium(payload)).unwrap();
        message.success(t('synaxarium.createSuccess'));
      }

      navigate('/synaxarium');
    } catch (error) {
      message.error(isEditing ? t('synaxarium.updateError') : t('synaxarium.createError'));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card loading={loading}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/synaxarium')}>
            {t('common.back')}
          </Button>
          <h2 style={{ margin: 0 }}>{isEditing ? t('synaxarium.edit') : t('synaxarium.create')}</h2>
        </div>

        <Form form={form} layout="vertical" initialValues={{ isActive: true }} onFinish={handleSubmit}>
          <Form.Item
            name="synaxarium_date"
            label={t('synaxarium.date')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="isActive" label={t('common.status')} valuePropName="checked">
            <Switch checkedChildren={t('common.active')} unCheckedChildren={t('common.inactive')} />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px' }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={creating || updating}>
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button onClick={() => navigate('/synaxarium')}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SynaxariumForm;
