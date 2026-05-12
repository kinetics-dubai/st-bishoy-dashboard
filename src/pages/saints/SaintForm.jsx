import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Switch, Image, Space, Typography, Row, Col, message } from 'antd';
import { UserOutlined, PictureOutlined, FileTextOutlined, BookOutlined } from '@ant-design/icons';
import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clearCurrentSaint, createSaint, fetchSaint, updateSaint } from '@/store/saintsSlice';
import Base64ImageUpload from '@/components/Base64ImageUpload';
import FormPageLayout from '@/components/FormPageLayout';
import FormSection from '@/components/FormSection';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { getRankOptions } from '@/lib/ranks';

const { TextArea } = Input;
const { Text } = Typography;

export default function SaintForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { currentSaint, loading, creating, updating } = useSelector((state) => state.saints);

  const isEditMode = Boolean(id);
  const watchedImage = Form.useWatch('image', form);
  const watchedFirstImage = Form.useWatch('first_image', form);
  const watchedSecondImage = Form.useWatch('second_image', form);
  const watchedHasDetails = Form.useWatch('hasDetails', form);
  const rankOptions = getRankOptions(t);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchSaint(id));
    } else {
      dispatch(clearCurrentSaint());
    }
    return () => { dispatch(clearCurrentSaint()); };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !currentSaint) return;
    form.setFieldsValue({
      name: currentSaint.name || '',
      name_ar: currentSaint.name_ar || '',
      rank: currentSaint.rank || undefined,
      departed: currentSaint.departed ?? false,
      image: currentSaint.image || '',
      description: currentSaint.description || '',
      hasDetails: currentSaint.hasDetails ?? false,
      first_paragraph: currentSaint.first_paragraph || '',
      first_image: currentSaint.first_image || '',
      second_paragraph: currentSaint.second_paragraph || '',
      second_image: currentSaint.second_image || '',
    });
  }, [currentSaint, form, isEditMode]);

  const handleSubmit = async (values) => {
    const payload = {
      name: values.name?.trim(),
      name_ar: values.name_ar?.trim(),
      ...(values.rank ? { rank: values.rank } : {}),
      departed: values.departed ?? false,
      image: values.image || '',
      description: values.description?.trim() || '',
      hasDetails: values.hasDetails ?? false,
      first_paragraph: values.hasDetails ? values.first_paragraph?.trim() || '' : '',
      first_image: values.hasDetails ? values.first_image || '' : '',
      second_paragraph: values.hasDetails ? values.second_paragraph?.trim() || '' : '',
      second_image: values.hasDetails ? values.second_image || '' : '',
    };

    try {
      if (isEditMode) {
        await dispatch(updateSaint({ id, data: payload })).unwrap();
        message.success(t('saints.updateSuccess'));
        navigate(`/saints/${id}`);
        return;
      }
      const response = await dispatch(createSaint(payload)).unwrap();
      message.success(t('saints.createSuccess'));
      navigate(`/saints/${response.id}`);
    } catch (submitError) {
      const fallback = isEditMode ? t('saints.updateError') : t('saints.createError');
      message.error(submitError?.message || submitError?.detail || fallback);
    }
  };

  const renderImagePreview = (src, label) => (
    <div style={{ marginTop: 12 }}>
      {src ? (
        <Image
          src={resolveMediaUrl(src)}
          alt={label}
          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
          fallback=""
        />
      ) : (
        <div style={{
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fdf9f4',
          borderRadius: 8,
          border: '1px dashed #d4c4a0',
          gap: 8,
        }}>
          <ImageIcon size={20} color="#bbb" />
          <Text type="secondary" style={{ fontSize: 12 }}>{t('saints.noImage')}</Text>
        </div>
      )}
    </div>
  );

  return (
    <FormPageLayout
      title={isEditMode ? t('saints.edit') : t('saints.create')}
      subtitle={t('saints.title')}
      backPath={isEditMode ? `/saints/${id}` : '/saints'}
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ departed: false, hasDetails: false }}
        onFinish={handleSubmit}
      >
        <FormSection icon={<UserOutlined />} title={t('saints.title')}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('saints.name')}
                name="name"
                rules={[
                  { required: true, message: t('validation.required', { field: t('saints.name') }) },
                  { min: 2, message: t('validation.minLength', { field: t('saints.name'), min: 2 }) },
                  { max: 120, message: t('validation.maxLength', { field: t('saints.name'), max: 120 }) },
                ]}
              >
                <Input size="large" placeholder={t('saints.namePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('saints.nameAr')}
                name="name_ar"
                rules={[
                  { required: true, message: t('validation.required', { field: t('saints.nameAr') }) },
                  { min: 2, message: t('validation.minLength', { field: t('saints.nameAr'), min: 2 }) },
                  { max: 120, message: t('validation.maxLength', { field: t('saints.nameAr'), max: 120 }) },
                ]}
              >
                <Input size="large" dir="rtl" placeholder={t('saints.nameArPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('saints.rank')}
                name="rank"
                rules={isEditMode ? [] : [{ required: true, message: t('validation.required', { field: t('saints.rank') }) }]}
              >
                <Select size="large" placeholder={t('saints.selectRank')} options={rankOptions} allowClear={isEditMode} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t('saints.departed')} name="departed" valuePropName="checked">
                <Switch checkedChildren={t('common.yes')} unCheckedChildren={t('common.no')} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<FileTextOutlined />} title={t('saints.description')}>
          <Form.Item
            name="description"
            rules={[{ required: true, message: t('validation.required', { field: t('saints.description') }) }]}
          >
            <TextArea rows={4} placeholder={t('saints.descriptionPlaceholder')} />
          </Form.Item>
        </FormSection>

        <FormSection icon={<PictureOutlined />} title={t('saints.image')}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="image" valuePropName="value">
                <Base64ImageUpload
                  buttonLabel={t('saints.uploadImage')}
                  emptyLabel={t('saints.noImage')}
                  removeLabel={t('saints.removeImage')}
                  errorLabel={t('saints.imageProcessError')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              {renderImagePreview(watchedImage, t('saints.image'))}
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<BookOutlined />} title={t('saints.storyDetails')}>
          <Form.Item label={t('saints.hasDetails')} name="hasDetails" valuePropName="checked">
            <Switch checkedChildren={t('common.yes')} unCheckedChildren={t('common.no')} />
          </Form.Item>

          {watchedHasDetails && (
            <>
              <Form.Item label={t('saints.firstParagraph')} name="first_paragraph">
                <TextArea rows={5} placeholder={t('saints.firstParagraphPlaceholder')} />
              </Form.Item>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item label={t('saints.firstImage')} name="first_image" valuePropName="value">
                    <Base64ImageUpload
                      buttonLabel={t('saints.uploadFirstImage')}
                      emptyLabel={t('saints.noImage')}
                      removeLabel={t('saints.removeImage')}
                      errorLabel={t('saints.imageProcessError')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  {renderImagePreview(watchedFirstImage, t('saints.firstImage'))}
                </Col>
              </Row>

              <Form.Item label={t('saints.secondParagraph')} name="second_paragraph">
                <TextArea rows={5} placeholder={t('saints.secondParagraphPlaceholder')} />
              </Form.Item>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item label={t('saints.secondImage')} name="second_image" valuePropName="value">
                    <Base64ImageUpload
                      buttonLabel={t('saints.uploadSecondImage')}
                      emptyLabel={t('saints.noImage')}
                      removeLabel={t('saints.removeImage')}
                      errorLabel={t('saints.imageProcessError')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  {renderImagePreview(watchedSecondImage, t('saints.secondImage'))}
                </Col>
              </Row>
            </>
          )}
        </FormSection>
      </Form>
    </FormPageLayout>
  );
}
