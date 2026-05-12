import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Select, Switch, message, Row, Col } from 'antd';
import { UserOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { fetchMonk, createMonk, updateMonk, clearCurrentMonk } from '@/store/monksSlice';
import { getRankOptions } from '@/lib/ranks';
import FormPageLayout from '@/components/FormPageLayout';
import FormSection from '@/components/FormSection';

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
    return () => { dispatch(clearCurrentMonk()); };
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
        navigate('/monks');
      } else {
        const response = await dispatch(createMonk(data)).unwrap();
        message.success(t('monk.monkCreated'));
        navigate(`/monks/${response.id}`);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.detail || t('common.error');
      message.error(errorMessage);
    }
  };

  return (
    <FormPageLayout
      title={isEditMode ? t('monk.editTitle') : t('monk.createTitle')}
      subtitle={isEditMode ? t('monk.editTitle') : t('monk.createTitle')}
      backPath="/monks"
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ departed: false }}
      >
        <FormSection icon={<UserOutlined />} title={t('monk.pageTitle')}>
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
                label={t('monk.position_ar')}
                name="position_ar"
                rules={[{ required: true, message: t('validation.required', { field: t('monk.position_ar') }) }]}
              >
                <Input size="large" dir="rtl" placeholder={t('monk.positionArPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('monk.rank')}
                name="rank"
                rules={isEditMode ? [] : [{ required: true, message: t('validation.required', { field: t('monk.rank') }) }]}
              >
                <Select size="large" placeholder={t('monk.selectRank')} options={rankOptions} allowClear={isEditMode} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<FileTextOutlined />} title={t('monk.biography')}>
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
        </FormSection>

        <FormSection icon={<CheckCircleOutlined />} title={t('monk.importantDates')}>
          <Form.Item label={t('monk.departed')} name="departed" valuePropName="checked">
            <Switch checkedChildren={t('monk.departedYes')} unCheckedChildren={t('monk.departedNo')} />
          </Form.Item>
        </FormSection>
      </Form>
    </FormPageLayout>
  );
}
