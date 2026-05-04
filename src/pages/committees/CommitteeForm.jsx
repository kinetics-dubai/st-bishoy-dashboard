import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography,
  message,
  Space
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCommittee, createCommittee, updateCommittee } from '@/store/committeesSlice';

const { Title } = Typography;
const { TextArea } = Input;
const { useForm } = Form;

export default function CommitteeForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [form] = useForm();
  
  const { currentCommittee, loading: committeeLoading, creating, updating } = useSelector(
    (state) => state.committees
  );

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchCommittee(id));
    }
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentCommittee) {
      form.setFieldsValue({
        name: currentCommittee.name_en || '',
        name_ar: currentCommittee.name || currentCommittee.name_ar || '',
        description: currentCommittee.description_en || '',
        description_ar: currentCommittee.description || currentCommittee.description_ar || '',
      });
    }
  }, [currentCommittee, form, isEdit]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.name_ar,
        name_en: values.name,
        description: values.description_ar || null,
        description_en: values.description || null,
      };

      if (isEdit) {
        await dispatch(updateCommittee({ id, data })).unwrap();
        message.success(t('committee.committeeUpdated'));
        navigate(`/committees/${id}`);
      } else {
        const response = await dispatch(createCommittee(data)).unwrap();
        message.success(t('committee.committeeCreated'));
        navigate(`/committees/${response.id}`);
        return;
      }
    } catch (error) {
      // Handle different error types
      const errorMessage = error?.message || error?.detail || t('common.error');
      
      // Handle validation errors specifically
      if (error?.errors) {
        const validationErrors = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        message.error(t('validation.failed', { errors: validationErrors }));
      } else {
        message.error(errorMessage);
      }
    }
  };

  const handleBack = () => {
    navigate('/committees');
  };

  if (isEdit && committeeLoading) {
    return <div className="p-6">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="mr-4"
        >
          {t('common.back')}
        </Button>
        <Title level={2} className="m-0">
          {isEdit ? t('committee.editTitle') : t('committee.createTitle')}
        </Title>
      </div>

      <Card className="max-w-2xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label={t('committee.name')}
            rules={[
              { required: true, message: t('validation.required') },
              { max: 255, message: t('validation.maxLength', { max: 255 }) },
            ]}
          >
            <Input placeholder={t('committee.name')} />
          </Form.Item>

          <Form.Item
            name="name_ar"
            label={t('committee.name_ar')}
            rules={[
              { required: true, message: t('validation.required') },
              { max: 255, message: t('validation.maxLength', { max: 255 }) },
            ]}
          >
            <Input placeholder={t('committee.name_ar')} dir="rtl" />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('committee.description')}
            rules={[
              { max: 1000, message: t('validation.maxLength', { max: 1000 }) },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t('committee.description')}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="description_ar"
            label={t('committee.description_ar')}
            rules={[
              { max: 1000, message: t('validation.maxLength', { max: 1000 }) },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t('committee.description_ar')}
              dir="rtl"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating || updating}
                icon={<SaveOutlined />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('common.save')}
              </Button>
              <Button onClick={handleBack}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
