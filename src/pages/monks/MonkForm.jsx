import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Space,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { fetchMonk, createMonk, updateMonk, clearCurrentMonk } from '@/store/monksSlice';
import { getRankOptions } from '@/lib/ranks';

const { Title } = Typography;
const { TextArea } = Input;

function normalizeText(value) {
  if (value == null) return value;
  return String(value).trim();
}

export default function MonkForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { currentMonk, loading, creating, updating } = useSelector((state) => state.monks);
  const rankOptions = getRankOptions(t);

  const isEditMode = !!id && !window.location.pathname.includes('/create');

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchMonk(id));
    } else {
      dispatch(clearCurrentMonk());
    }

    return () => {
      dispatch(clearCurrentMonk());
    };
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentMonk && isEditMode) {
      form.setFieldsValue({
        name: normalizeText(currentMonk.name || ''),
        name_ar: normalizeText(currentMonk.name_ar || ''),
        rank: currentMonk.rank || undefined,
        position: normalizeText(currentMonk.position || ''),
        position_ar: normalizeText(currentMonk.position_ar || ''),
        bio: currentMonk.bio || '',
        bio_ar: currentMonk.bio_ar || '',
        departed: currentMonk.departed ?? false,
      });
    }
  }, [currentMonk, form, isEditMode]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: normalizeText(values.name),
        name_ar: normalizeText(values.name_ar),
        ...(values.rank ? { rank: values.rank } : {}),
        position: normalizeText(values.position),
        position_ar: normalizeText(values.position_ar),
        bio: normalizeText(values.bio) || '',
        bio_ar: normalizeText(values.bio_ar) || '',
        departed: values.departed ?? false,
      };

      if (isEditMode) {
        await dispatch(updateMonk({ id, data })).unwrap();
        message.success(t('monk.monkUpdated'));
      } else {
        const response = await dispatch(createMonk(data)).unwrap();
        message.success(t('monk.monkCreated'));
        navigate(`/monks/${response.id}`);
        return;
      }

      navigate('/monks');
    } catch (error) {
      const errorMessage = error?.message || error?.detail || t('common.error');
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

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Title level={3} style={{ margin: 0, color: '#5C1A1B' }}>
              {isEditMode ? t('common.edit') : t('navigation.createMonk')}
            </Title>
          </Space>
        </div>

        <Card loading={loading && isEditMode}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ departed: false }}>
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.name')}
                  name="name"
                  rules={[
                    { required: true, message: t('validation.required', { field: t('monk.name') }) },
                    { min: 2, message: t('validation.minLength', { field: t('monk.name'), min: 2 }) },
                    { max: 100, message: t('validation.maxLength', { field: t('monk.name'), max: 100 }) },
                  ]}
                >
                  <Input size="large" placeholder={t('monk.namePlaceholder')} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.name_ar')}
                  name="name_ar"
                  rules={[
                    { required: true, message: t('validation.required', { field: t('monk.name_ar') }) },
                    { min: 2, message: t('validation.minLength', { field: t('monk.name_ar'), min: 2 }) },
                    { max: 100, message: t('validation.maxLength', { field: t('monk.name_ar'), max: 100 }) },
                  ]}
                >
                  <Input size="large" dir="rtl" placeholder={t('monk.nameArPlaceholder')} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.position')}
                  name="position"
                  rules={[{ required: true, message: t('validation.required', { field: t('monk.position') }) }]}
                >
                  <Input size="large" placeholder={t('monk.positionPlaceholder')} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.rank')}
                  name="rank"
                  rules={
                    isEditMode
                      ? []
                      : [{ required: true, message: t('validation.required', { field: t('monk.rank') }) }]
                  }
                >
                  <Select
                    size="large"
                    placeholder={t('monk.selectRank')}
                    options={rankOptions}
                    allowClear={isEditMode}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.position_ar')}
                  name="position_ar"
                  rules={[{ required: true, message: t('validation.required', { field: t('monk.position_ar') }) }]}
                >
                  <Input size="large" dir="rtl" placeholder={t('monk.positionArPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.bio')}
                  name="bio"
                  rules={[{ max: 2000, message: t('validation.maxLength', { field: t('monk.bio'), max: 2000 }) }]}
                >
                  <TextArea rows={6} placeholder={t('monk.bioPlaceholder')} showCount maxLength={2000} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={t('monk.bio_ar')}
                  name="bio_ar"
                  rules={[{ max: 2000, message: t('validation.maxLength', { field: t('monk.bio_ar'), max: 2000 }) }]}
                >
                  <TextArea rows={6} dir="rtl" placeholder={t('monk.bioArabicPlaceholder')} showCount maxLength={2000} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={t('monk.departed')} name="departed" valuePropName="checked">
              <Switch checkedChildren={t('monk.departedYes')} unCheckedChildren={t('monk.departedNo')} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={creating || updating} style={{ background: '#5C1A1B' }}>
                  {isEditMode ? t('common.save') : t('common.create')}
                </Button>
                <Button onClick={() => navigate('/monks')}>
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
