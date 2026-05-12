import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Form, Input, Row, Col, DatePicker, message } from 'antd';
import { SoundOutlined, LinkOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchSermon, createSermon, updateSermon, clearCurrentSermon } from '@/store/sermonsSlice';
import FormPageLayout from '@/components/FormPageLayout';
import FormSection from '@/components/FormSection';

export default function SermonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { currentSermon, creating, updating } = useSelector((state) => state.sermons);

  const isEditMode = !!id && !window.location.pathname.includes('/create');

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchSermon(id));
    } else {
      dispatch(clearCurrentSermon());
    }
    return () => { dispatch(clearCurrentSermon()); };
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentSermon && isEditMode) {
      form.setFieldsValue({
        title: currentSermon.title || '',
        title_ar: currentSermon.title_ar || '',
        date: currentSermon.date ? dayjs(currentSermon.date) : null,
        video_url: currentSermon.video_url || '',
      });
    }
  }, [currentSermon, form, isEditMode]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title?.trim(),
        title_ar: values.title_ar?.trim(),
        date: values.date ? values.date.format('YYYY-MM-DD') : '',
        video_url: values.video_url?.trim() || '',
      };

      if (isEditMode) {
        await dispatch(updateSermon({ id, data })).unwrap();
        message.success(t('sermons.updateSuccess'));
        navigate('/sermons');
      } else {
        const response = await dispatch(createSermon(data)).unwrap();
        message.success(t('sermons.createSuccess'));
        navigate(`/sermons/${response.id}`);
      }
    } catch (error) {
      message.error(error?.message || error?.detail || t('common.error'));
    }
  };

  return (
    <FormPageLayout
      title={isEditMode ? t('sermons.edit') : t('sermons.create')}
      subtitle={t('navigation.sermons')}
      backPath="/sermons"
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <FormSection icon={<SoundOutlined />} title={t('navigation.sermons')}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('sermons.title')}
                name="title"
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Input size="large" placeholder={t('sermons.titlePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('sermons.title_ar')}
                name="title_ar"
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Input size="large" dir="rtl" placeholder={t('sermons.titleArPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('sermons.date')}
                name="date"
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <DatePicker size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('sermons.video_url')}
                name="video_url"
                rules={[
                  { required: true, message: t('validation.required') },
                  { type: 'url', message: t('validation.url') },
                ]}
              >
                <Input size="large" placeholder={t('sermons.videoUrlPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      </Form>
    </FormPageLayout>
  );
}
