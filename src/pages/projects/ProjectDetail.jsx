import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Space, Popconfirm, Empty, Descriptions, Typography, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchProject, deleteProject } from '@/store/projectsSlice';
import CenteredLoader from '@/components/CenteredLoader';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const { Title } = Typography;

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentProject, loading, error } = useSelector((state) => state.projects);

  useEffect(() => {
    if (id) dispatch(fetchProject(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteProject(id)).unwrap();
      message.success(t('projects.deleteSuccess'));
      navigate('/projects');
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const displayTitle =
    i18n.language === 'ar' && currentProject?.title_ar
      ? currentProject.title_ar
      : currentProject?.title;

  if (loading) return <CenteredLoader minHeight="calc(100vh - 220px)" />;

  if (!currentProject) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description={error || t('common.notAvailable')} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/projects')}
          >
            {t('common.back')}
          </Button>
        </div>

        {currentProject.thumbnail && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={resolveMediaUrl(currentProject.thumbnail)}
              alt={displayTitle}
              style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }}
            />
          </div>
        )}

        <Title level={3} style={{ color: '#6B1A1A', marginBottom: 16 }}>
          {displayTitle || t('common.notAvailable')}
        </Title>

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label={t('projects.title')}>
            {currentProject.title || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('projects.title_ar')}>
            {currentProject.title_ar || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('projects.description')}>
            {currentProject.description || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('projects.description_ar')}>
            {currentProject.description_ar || t('common.notAvailable')}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects/${id}/edit`)}
            style={{ background: '#6B1A1A' }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('projects.deleteConfirm', { title: displayTitle })}
            onConfirm={handleDelete}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </div>
  );
}
