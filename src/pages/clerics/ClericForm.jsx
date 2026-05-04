import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Switch,
  Space,
  Avatar,
  message,
  Typography,
  Row,
  Col,
  ConfigProvider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import enUS from 'antd/locale/en_US';
import {
  fetchCleric,
  createCleric,
  updateCleric,
  clearCurrentCleric,
} from '@/store/clericsSlice';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const DATE_PICKER_LOCALE = enUS.DatePicker;

const RANKS = [
  'Bishop',
  'Metropolitan',
  'General Bishop',
  'Pope',
  'Hegumen',
  'Priest',
  'Deacon',
  'Monk',
  'Abbot',
];

function normalizeRank(rank) {
  if (!rank) return rank;
  const match = RANKS.find((r) => r.toLowerCase() === String(rank).toLowerCase());
  return match || rank;
}

function normalizeText(value) {
  if (value == null) return value;
  return String(value).trim();
}

export default function ClericForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const { currentCleric, loading, creating, updating } = useSelector((state) => state.clerics);
  const [pictureUrl, setPictureUrl] = useState('');

  const isEditMode = !!id && !window.location.pathname.includes('/create');

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchCleric(id));
    } else {
      dispatch(clearCurrentCleric());
    }
    return () => {
      dispatch(clearCurrentCleric());
    };
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentCleric && isEditMode) {
      form.setFieldsValue({
        name: normalizeText(currentCleric.name_en || currentCleric.name || ''),
        name_ar: normalizeText(currentCleric.name_ar || currentCleric.name || ''),
        rank: normalizeRank(currentCleric.rank),
        picture: currentCleric.picture,
        isActive: currentCleric.isActive ?? true,
        bio: currentCleric.bio,
        bio_arabic: currentCleric.bio_arabic,
        birthDate: currentCleric.birthDate ? dayjs(currentCleric.birthDate) : null,
        monasticismDate: currentCleric.monasticismDate ? dayjs(currentCleric.monasticismDate) : null,
        episcopacyDate: currentCleric.episcopacyDate ? dayjs(currentCleric.episcopacyDate) : null,
        patriarchateDate: currentCleric.patriarchateDate ? dayjs(currentCleric.patriarchateDate) : null,
      });
      setPictureUrl(currentCleric.picture || '');
    }
  }, [currentCleric, form, isEditMode]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        rank: normalizeRank(values.rank),
        picture: values.picture,
        isActive: values.isActive ?? true,
        name: normalizeText(values.name_ar),
        name_en: normalizeText(values.name),
        bio: values.bio,
        bio_arabic: values.bio_arabic,
        birthDate: values.birthDate?.format('YYYY-MM-DD'),
        monasticismDate: values.monasticismDate?.format('YYYY-MM-DD'),
        episcopacyDate: values.episcopacyDate?.format('YYYY-MM-DD'),
        patriarchateDate: values.patriarchateDate?.format('YYYY-MM-DD'),
      };

      if (isEditMode) {
        await dispatch(updateCleric({ id, data })).unwrap();
        message.success(t('cleric.clericUpdated'));
      } else {
        const response = await dispatch(createCleric(data)).unwrap();
        message.success(t('cleric.clericCreated'));
        navigate(`/clerics/${response.id}`);
        return;
      }
      navigate('/clerics');
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

  const handlePictureChange = (e) => {
    const url = e.target.value;
    setPictureUrl(url);
    form.setFieldsValue({ picture: url });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Title level={3} style={{ margin: 0, color: '#5C1A1B' }}>
              {isEditMode ? t('common.edit') : t('navigation.createCleric')}
            </Title>
          </Space>
        </div>

        <Card loading={loading && isEditMode}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isActive: true, rank: 'Priest' }}
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} md={16}>
                <Form.Item
                  label={t('cleric.name')}
                  name="name"
                  rules={[
                    { required: true, message: t('validation.required', { field: t('cleric.name') }) },
                    {
                      validator: (_, value) => {
                        if (value == null || value === '') return Promise.resolve();
                        if (String(value).trim().length === 0) {
                          return Promise.reject(new Error(t('validation.required', { field: t('cleric.name') })));
                        }
                        return Promise.resolve();
                      },
                    },
                    { min: 2, message: t('validation.minLength', { field: t('cleric.name'), min: 2 }) },
                    { max: 100, message: t('validation.maxLength', { field: t('cleric.name'), max: 100 }) },
                    { 
                      pattern: /^[a-zA-Z\s'-]+$/, 
                      message: t('validation.namePattern', { field: t('cleric.name') }) 
                    },
                  ]}
                >
                  <Input size="large" placeholder={t('cleric.namePlaceholder')} />
                </Form.Item>

                <Form.Item
                  label={t('cleric.name_ar')}
                  name="name_ar"
                  rules={[
                    { required: true, message: t('validation.required', { field: t('cleric.name_ar') }) },
                    {
                      validator: (_, value) => {
                        if (value == null || value === '') return Promise.resolve();
                        if (String(value).trim().length === 0) {
                          return Promise.reject(new Error(t('validation.required', { field: t('cleric.name_ar') })));
                        }
                        return Promise.resolve();
                      },
                    },
                    { min: 2, message: t('validation.minLength', { field: t('cleric.name_ar'), min: 2 }) },
                    { max: 100, message: t('validation.maxLength', { field: t('cleric.name_ar'), max: 100 }) },
                    { 
                      pattern: /^[\u0600-\u06FF\s'-]+$/, 
                      message: t('validation.arabicNamePattern', { field: t('cleric.name_ar') }) 
                    },
                  ]}
                >
                  <Input size="large" dir="rtl" placeholder={t('cleric.nameArPlaceholder')} />
                </Form.Item>

                <Form.Item
                  label={t('cleric.rank')}
                  name="rank"
                  rules={[{ required: true, message: t('validation.required', { field: t('cleric.rank') }) }]}
                >
                  <Select size="large" placeholder={t('cleric.selectRank')}>
                    {RANKS.map((rank) => (
                      <Option key={rank} value={rank}>
                        {t(`cleric.ranks.${rank}`, { defaultValue: rank })}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>


                <Form.Item
                  label={t('cleric.isActive')}
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <Avatar
                  src={pictureUrl}
                  size={200}
                  style={{ background: '#5C1A1B', marginBottom: 16 }}
                >
                  <UserOutlined style={{ fontSize: 80 }} />
                </Avatar>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t('cleric.bio')}
                  name="bio"
                  rules={[
                    { max: 2000, message: t('validation.maxLength', { field: t('cleric.bio'), max: 2000 }) },
                  ]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder={t('cleric.bioPlaceholder')}
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t('cleric.bio_arabic')}
                  name="bio_arabic"
                  rules={[
                    { max: 2000, message: t('validation.maxLength', { field: t('cleric.bio_arabic'), max: 2000 }) },
                  ]}
                >
                  <TextArea 
                    rows={6} 
                    dir="rtl" 
                    placeholder={t('cleric.bioArabicPlaceholder')}
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Col>
            </Row>

            <ConfigProvider locale={DATE_PICKER_LOCALE}>
            <Row gutter={[24, 0]}>
              <Col xs={24} md={6}>
                <Form.Item
                  label={t('cleric.birthDate')}
                  name="birthDate"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value && value.isAfter(dayjs(), 'day')) {
                          return Promise.reject(new Error(t('validation.birthDateFuture')));
                        }
                        if (value && value.isBefore(dayjs().subtract(120, 'year'), 'day')) {
                          return Promise.reject(new Error(t('validation.birthDateTooOld')));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker 
                    locale={DATE_PICKER_LOCALE}
                    style={{ width: '100%' }} 
                    placeholder={t('cleric.selectBirthDate')}
                    disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label={t('cleric.monasticismDate')}
                  name="monasticismDate"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const birthDate = getFieldValue('birthDate');
                        if (value && birthDate && value.isBefore(birthDate, 'day')) {
                          return Promise.reject(new Error(t('validation.monasticismDateBeforeBirth')));
                        }
                        if (value && value.isAfter(dayjs(), 'day')) {
                          return Promise.reject(new Error(t('validation.dateFuture')));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    locale={DATE_PICKER_LOCALE}
                    style={{ width: '100%' }} 
                    placeholder={t('cleric.selectMonasticismDate')}
                    disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label={t('cleric.episcopacyDate')}
                  name="episcopacyDate"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const monasticismDate = getFieldValue('monasticismDate');
                        const birthDate = getFieldValue('birthDate');
                        if (value && birthDate && value.isBefore(birthDate, 'day')) {
                          return Promise.reject(new Error(t('validation.episcopacyDateBeforeBirth')));
                        }
                        if (value && monasticismDate && value.isBefore(monasticismDate, 'day')) {
                          return Promise.reject(new Error(t('validation.episcopacyDateBeforeMonasticism')));
                        }
                        if (value && value.isAfter(dayjs(), 'day')) {
                          return Promise.reject(new Error(t('validation.dateFuture')));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    locale={DATE_PICKER_LOCALE}
                    style={{ width: '100%' }} 
                    placeholder={t('cleric.selectEpiscopacyDate')}
                    disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label={t('cleric.patriarchateDate')}
                  name="patriarchateDate"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const episcopacyDate = getFieldValue('episcopacyDate');
                        const monasticismDate = getFieldValue('monasticismDate');
                        const birthDate = getFieldValue('birthDate');
                        if (value && birthDate && value.isBefore(birthDate, 'day')) {
                          return Promise.reject(new Error(t('validation.patriarchateDateBeforeBirth')));
                        }
                        if (value && monasticismDate && value.isBefore(monasticismDate, 'day')) {
                          return Promise.reject(new Error(t('validation.patriarchateDateBeforeMonasticism')));
                        }
                        if (value && episcopacyDate && value.isBefore(episcopacyDate, 'day')) {
                          return Promise.reject(new Error(t('validation.patriarchateDateBeforeEpiscopacy')));
                        }
                        if (value && value.isAfter(dayjs(), 'day')) {
                          return Promise.reject(new Error(t('validation.dateFuture')));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    locale={DATE_PICKER_LOCALE}
                    style={{ width: '100%' }} 
                    placeholder={t('cleric.selectPatriarchateDate')}
                    disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                  />
                </Form.Item>
              </Col>
            </Row>
            </ConfigProvider>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={creating || updating}
                  style={{ background: '#5C1A1B' }}
                >
                  {isEditMode ? t('common.save') : t('common.create')}
                </Button>
                <Button onClick={() => navigate('/clerics')}>
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
