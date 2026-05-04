import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Upload, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, BookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createMagazine, updateMagazine, fetchMagazine, clearError } from '@/store/magazinesSlice';

const { TextArea } = Input;
const { Title, Text } = Typography;

const MagazineForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = !!id;
  const { currentMagazine, loading, updating, creating, error } = useSelector((state) => state.magazines);

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchMagazine(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentMagazine) {
      form.setFieldsValue({
        title: currentMagazine.title,
        description: currentMagazine.description,
        cover_photo: currentMagazine.cover_photo,
      });
    }
  }, [currentMagazine, form, isEditing]);

  useEffect(() => {
    if (error) {
      message.error(t('magazines.saveError'));
    }
  }, [error, t]);

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
      };

      if (isEditing) {
        await dispatch(updateMagazine({ id, data: submitData })).unwrap();
        message.success(t('magazines.updateSuccess'));
      } else {
        await dispatch(createMagazine(submitData)).unwrap();
        message.success(t('magazines.createSuccess'));
      }
      navigate('/magazines');
    } catch (error) {
      // Error is handled in the slice
    }
  };

  const handleCancel = () => {
    dispatch(clearError());
    navigate('/magazines');
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            {t('common.back')}
          </Button>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined style={{ color: '#5C1A1B' }} />
            {isEditing ? t('magazines.edit') : t('magazines.create')}
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '800px' }}
        >
          {/* Basic Information */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '16px', color: '#5C1A1B' }}>
              {t('magazines.basicInfo')}
            </Title>
            
            <Form.Item
              name="title"
              label={t('magazines.title')}
              rules={[
                { required: true, message: t('validation.required') },
                { min: 3, message: t('validation.minLength', { min: 3 }) },
                { max: 200, message: t('validation.maxLength', { max: 200 }) },
              ]}
            >
              <Input
                placeholder={t('magazines.titlePlaceholder')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={t('magazines.description')}
              rules={[
                { required: true, message: t('validation.required') },
                { min: 10, message: t('validation.minLength', { min: 10 }) },
                { max: 1000, message: t('validation.maxLength', { max: 1000 }) },
              ]}
            >
              <TextArea
                placeholder={t('magazines.descriptionPlaceholder')}
                rows={4}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </div>

          {/* Cover Photo */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '16px', color: '#5C1A1B' }}>
              {t('magazines.coverPhoto')}
            </Title>
            
            <Form.Item
              name="cover_photo"
              label={t('magazines.coverPhotoUrl')}
              rules={[
                { required: true, message: t('validation.required') },
                { type: 'url', message: t('validation.url') },
              ]}
              extra={t('magazines.coverPhotoHelp')}
            >
              <Input
                placeholder="https://example.com/cover.jpg"
                size="large"
                prefix={<BookOutlined style={{ color: '#5C1A1B' }} />}
              />
            </Form.Item>

            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                {t('magazines.preview')}
              </Text>
              <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.cover_photo !== currentValues.cover_photo}>
                {() => {
                  const coverPhoto = form.getFieldValue('cover_photo');
                  return (
                    <div style={{ textAlign: 'center', padding: '16px', border: '2px dashed #d9d9d9', borderRadius: '8px' }}>
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt="Cover preview"
                          style={{ maxWidth: '200px', maxHeight: '250px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      {!coverPhoto && (
                        <div style={{ color: '#999', padding: '20px' }}>
                          <BookOutlined style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }} />
                          <Text type="secondary">{t('magazines.noPreview')}</Text>
                        </div>
                      )}
                    </div>
                  );
                }}
              </Form.Item>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space size="large">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updating || creating}
                  size="large"
                  style={{ minWidth: '120px' }}
                >
                  {isEditing ? t('common.update') : t('common.create')}
                </Button>
                <Button
                  onClick={handleCancel}
                  size="large"
                  style={{ minWidth: '120px' }}
                >
                  {t('common.cancel')}
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default MagazineForm;
