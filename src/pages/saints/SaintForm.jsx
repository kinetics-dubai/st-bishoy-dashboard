import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Church, ImageIcon } from 'lucide-react';
import { clearCurrentSaint, createSaint, fetchSaint, updateSaint } from '@/store/saintsSlice';
import Base64ImageUpload from '@/components/Base64ImageUpload';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { getRankOptions } from '@/lib/ranks';

const { TextArea } = Input;
const { Title, Text } = Typography;

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

    return () => {
      dispatch(clearCurrentSaint());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !currentSaint) return;

    form.setFieldsValue({
      name: currentSaint.name || '',
      name_ar: currentSaint.name_ar || '',
      rank: currentSaint.rank || undefined,
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

  const renderPreview = (src, label) => (
    <Card size="small" title={label}>
      {src ? (
        <Image src={resolveMediaUrl(src)} alt={label} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12 }} fallback="" />
      ) : (
        <div style={{ minHeight: 180, display: 'grid', placeItems: 'center', color: '#999' }}>
          <Space direction="vertical" align="center" size={8}>
            <ImageIcon size={22} />
            <Text type="secondary">{t('saints.noImage')}</Text>
          </Space>
        </div>
      )}
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(isEditMode ? `/saints/${id}` : '/saints')}>
              {t('common.back')}
            </Button>
            <Title level={3} style={{ margin: 0, color: '#5C1A1B' }}>
              {isEditMode ? t('saints.edit') : t('saints.create')}
            </Title>
          </Space>
        </div>

        <Card loading={loading && isEditMode}>
          <Form form={form} layout="vertical" initialValues={{ hasDetails: false }} onFinish={handleSubmit}>
            <Row gutter={[24, 0]}>
              <Col xs={24} lg={16}>
                <Row gutter={16}>
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
                      <Input placeholder={t('saints.namePlaceholder')} />
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
                      <Input dir="rtl" placeholder={t('saints.nameArPlaceholder')} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t('saints.rank')}
                      name="rank"
                      rules={
                        isEditMode
                          ? []
                          : [{ required: true, message: t('validation.required', { field: t('saints.rank') }) }]
                      }
                    >
                      <Select
                        placeholder={t('saints.selectRank')}
                        options={rankOptions}
                        allowClear={isEditMode}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label={t('saints.image')} name="image" valuePropName="value">
                  <Base64ImageUpload
                    buttonLabel={t('saints.uploadImage')}
                    emptyLabel={t('saints.noImage')}
                    removeLabel={t('saints.removeImage')}
                    errorLabel={t('saints.imageProcessError')}
                  />
                </Form.Item>

                <Form.Item
                  label={t('saints.description')}
                  name="description"
                  rules={[{ required: true, message: t('validation.required', { field: t('saints.description') }) }]}
                >
                  <TextArea rows={4} placeholder={t('saints.descriptionPlaceholder')} />
                </Form.Item>

                <Form.Item label={t('saints.hasDetails')} name="hasDetails" valuePropName="checked">
                  <Switch checkedChildren={t('common.yes')} unCheckedChildren={t('common.no')} />
                </Form.Item>

                {watchedHasDetails ? (
                  <>
                    <Form.Item label={t('saints.firstParagraph')} name="first_paragraph">
                      <TextArea rows={5} placeholder={t('saints.firstParagraphPlaceholder')} />
                    </Form.Item>

                    <Form.Item label={t('saints.firstImage')} name="first_image" valuePropName="value">
                      <Base64ImageUpload
                        buttonLabel={t('saints.uploadFirstImage')}
                        emptyLabel={t('saints.noImage')}
                        removeLabel={t('saints.removeImage')}
                        errorLabel={t('saints.imageProcessError')}
                      />
                    </Form.Item>

                    <Form.Item label={t('saints.secondParagraph')} name="second_paragraph">
                      <TextArea rows={5} placeholder={t('saints.secondParagraphPlaceholder')} />
                    </Form.Item>

                    <Form.Item label={t('saints.secondImage')} name="second_image" valuePropName="value">
                      <Base64ImageUpload
                        buttonLabel={t('saints.uploadSecondImage')}
                        emptyLabel={t('saints.noImage')}
                        removeLabel={t('saints.removeImage')}
                        errorLabel={t('saints.imageProcessError')}
                      />
                    </Form.Item>
                  </>
                ) : null}
              </Col>

              <Col xs={24} lg={8}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Card size="small" title={t('saints.preview')}>
                    <div style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
                      {watchedImage ? (
                        <Image src={resolveMediaUrl(watchedImage)} alt={t('saints.image')} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12 }} fallback="" />
                      ) : (
                        <Space direction="vertical" align="center" size={8}>
                          <Church size={28} color="#5C1A1B" />
                          <Text type="secondary">{t('saints.noImage')}</Text>
                        </Space>
                      )}
                    </div>
                  </Card>
                  {renderPreview(watchedFirstImage, t('saints.firstImage'))}
                  {renderPreview(watchedSecondImage, t('saints.secondImage'))}
                </Space>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={creating || updating} style={{ background: '#5C1A1B' }}>
                  {isEditMode ? t('common.update') : t('common.create')}
                </Button>
                <Button onClick={() => navigate(isEditMode ? `/saints/${id}` : '/saints')}>
                  {t('common.cancel')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
