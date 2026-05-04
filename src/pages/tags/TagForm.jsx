import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Select, Typography, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, TagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createTag, updateTag, fetchTag, clearError } from '@/store/tagsSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const TagForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = !!id;
  const { currentTag, loading, updating, creating, error } = useSelector((state) => state.tags);
  const [slugValue, setSlugValue] = useState('');

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchTag(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentTag) {
      form.setFieldsValue({
        name: currentTag.name,
        category: currentTag.category,
      });
      setSlugValue(currentTag.slug);
    }
  }, [currentTag, form, isEditing]);

  useEffect(() => {
    if (error) {
      message.error(t('tags.saveError'));
    }
  }, [error, t]);

  const generateSlug = (name, category) => {
    if (!name) return '';
    
    // Convert to lowercase and replace spaces with hyphens
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    
    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    
    // Add category prefix
    if (category && slug) {
      slug = `${category}-${slug}`;
    }
    
    return slug;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const category = form.getFieldValue('category');
    const newSlug = generateSlug(name, category);
    setSlugValue(newSlug);
  };

  const handleCategoryChange = (category) => {
    const name = form.getFieldValue('name');
    const newSlug = generateSlug(name, category);
    setSlugValue(newSlug);
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        slug: slugValue,
      };

      if (isEditing) {
        await dispatch(updateTag({ id, data: submitData })).unwrap();
        message.success(t('tags.updateSuccess'));
      } else {
        await dispatch(createTag(submitData)).unwrap();
        message.success(t('tags.createSuccess'));
      }
      navigate('/tags');
    } catch (error) {
      // Error is handled in the slice
    }
  };

  const handleCancel = () => {
    dispatch(clearError());
    navigate('/tags');
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
            <TagOutlined style={{ color: '#5C1A1B' }} />
            {isEditing ? t('tags.edit') : t('tags.create')}
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '600px' }}
        >
          {!isEditing && (
            <Alert
              style={{ marginBottom: '24px' }}
              type="info"
              showIcon
              message={t('tags.defaultArabicTranslationNotice')}
            />
          )}

          {/* Tag Name */}
          <Form.Item
            name="name"
            label={t('tags.name')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 2, message: t('validation.minLength', { min: 2 }) },
              { max: 50, message: t('validation.maxLength', { max: 50 }) },
            ]}
          >
            <Input
              placeholder={t('tags.namePlaceholder')}
              size="large"
              onChange={handleNameChange}
            />
          </Form.Item>

          {/* Category */}
          <Form.Item
            name="category"
            label={t('tags.category')}
            rules={[
              { required: true, message: t('validation.required') },
            ]}
          >
            <Select
              placeholder={t('tags.selectCategory')}
              size="large"
              onChange={handleCategoryChange}
              disabled={isEditing}
            >
              <Option value="article">{t('tags.article')}</Option>
              <Option value="entity">{t('tags.entity')}</Option>
            </Select>
          </Form.Item>

          {/* Generated Slug (Read-only) */}
          <Form.Item label={t('tags.generatedSlug')}>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px 16px', 
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {slugValue || (
                <Text type="secondary">{t('tags.slugPlaceholder')}</Text>
              )}
            </div>
          </Form.Item>

          {/* Category Preview */}
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.category !== currentValues.category}>
            {() => {
              const category = form.getFieldValue('category');
              return category ? (
                <div style={{ marginBottom: '24px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    {t('tags.categoryPreview')}:
                  </Text>
                  <div style={{ 
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: category === 'article' ? '#e6f7ff' : '#f6ffed',
                    border: `1px solid ${category === 'article' ? '#91d5ff' : '#b7eb8f'}`,
                    color: category === 'article' ? '#1890ff' : '#52c41a',
                    display: 'inline-block',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {category}
                  </div>
                </div>
              ) : null;
            }}
          </Form.Item>

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

export default TagForm;
