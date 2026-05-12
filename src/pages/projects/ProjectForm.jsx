import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Form, Input, Row, Col, message } from 'antd';
import { ProjectOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { fetchProject, createProject, updateProject, clearCurrentProject } from '@/store/projectsSlice';
import Base64ImageUpload from '@/components/Base64ImageUpload';
import FormPageLayout from '@/components/FormPageLayout';
import FormSection from '@/components/FormSection';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const { TextArea } = Input;

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { currentProject, loading, creating, updating } = useSelector((state) => state.projects);

  const isEditMode = !!id && !window.location.pathname.includes('/create');
  const watchedThumbnail = Form.useWatch('thumbnail', form);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchProject(id));
    } else {
      dispatch(clearCurrentProject());
    }
    return () => { dispatch(clearCurrentProject()); };
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentProject && isEditMode) {
      form.setFieldsValue({
        title: currentProject.title || '',
        title_ar: currentProject.title_ar || '',
        description: currentProject.description || '',
        description_ar: currentProject.description_ar || '',
        thumbnail: currentProject.thumbnail || '',
      });
    }
  }, [currentProject, form, isEditMode]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title?.trim(),
        title_ar: values.title_ar?.trim(),
        description: values.description?.trim() || '',
        description_ar: values.description_ar?.trim() || '',
      };

      if (values.thumbnail?.startsWith('data:')) {
        data.thumbnail = values.thumbnail;
      } else if (!isEditMode && values.thumbnail) {
        data.thumbnail = values.thumbnail;
      }

      if (isEditMode) {
        await dispatch(updateProject({ id, data })).unwrap();
        message.success(t('projects.updateSuccess'));
        navigate('/projects');
      } else {
        const response = await dispatch(createProject(data)).unwrap();
        message.success(t('projects.createSuccess'));
        navigate(`/projects/${response.id}`);
      }
    } catch (error) {
      message.error(error?.message || error?.detail || t('common.error'));
    }
  };

  const previewUrl = watchedThumbnail && !watchedThumbnail.startsWith('data:')
    ? resolveMediaUrl(watchedThumbnail)
    : watchedThumbnail;

  return (
    <FormPageLayout
      title={isEditMode ? t('projects.edit') : t('projects.create')}
      subtitle={t('navigation.projects')}
      backPath="/projects"
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <FormSection icon={<ProjectOutlined />} title={t('navigation.projects')}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('projects.title')}
                name="title"
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Input size="large" placeholder={t('projects.titlePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('projects.title_ar')}
                name="title_ar"
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Input size="large" dir="rtl" placeholder={t('projects.titleArPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<FileTextOutlined />} title={t('projects.description')}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label={t('projects.description')} name="description">
                <TextArea rows={5} placeholder={t('projects.descriptionPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t('projects.description_ar')} name="description_ar">
                <TextArea rows={5} dir="rtl" placeholder={t('projects.descriptionArPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<PictureOutlined />} title={t('projects.thumbnail')}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="thumbnail">
                <Base64ImageUpload
                  buttonLabel={t('projects.uploadThumbnail')}
                  emptyLabel={t('projects.noThumbnail')}
                  removeLabel={t('common.delete')}
                  errorLabel={t('projects.imageProcessError')}
                />
              </Form.Item>
            </Col>
            {previewUrl && (
              <Col xs={24} md={12}>
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
                />
              </Col>
            )}
          </Row>
        </FormSection>
      </Form>
    </FormPageLayout>
  );
}
