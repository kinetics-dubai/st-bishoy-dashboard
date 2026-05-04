import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Avatar,
  Tag,
  Space,
  Popconfirm,
  Skeleton,
  Empty,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { fetchCleric, deleteCleric } from '@/store/clericsSlice';
import CenteredLoader from '@/components/CenteredLoader';

const { Title, Paragraph } = Typography;

export default function ClericDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentCleric, loading } = useSelector((state) => state.clerics);

  useEffect(() => {
    if (id) {
      dispatch(fetchCleric(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteCleric(id)).unwrap();
      message.success(t('cleric.clericDeleted'));
      navigate('/clerics');
    } catch (error) {
      message.error(error.message || t('common.error'));
    }
  };

  const getClericName = () => {
    if (!currentCleric) return '';
    return i18n.language === 'ar' && currentCleric.name_ar
      ? currentCleric.name_ar
      : currentCleric.name;
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <CenteredLoader minHeight="calc(100vh - 220px)" />;
  }

  if (!currentCleric) {
    return (
      <div className="p-6">
        <Empty description={t('error.notFound')} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/clerics')}
            className="mr-4"
          >
            {t('common.back')}
          </Button>
        </div>

        {/* Main Card Layout */}
        <Card>
        <div className="text-center mb-6">
          {/* Large Avatar */}
          <Avatar
            src={currentCleric.picture}
            size={120}
            className="mx-auto mb-4"
            style={{ background: '#5C1A1B' }}
          >
            <UserOutlined size={48} />
          </Avatar>

          {/* Name and Badges */}
          <Title level={1} className="m-0 mb-2">
            {getClericName()}
          </Title>
          
          <Space className="mb-4">
            <Tag color="#B7884F" className="text-sm px-3 py-1">
              {t(`cleric.ranks.${currentCleric.rank}`) || currentCleric.rank}
            </Tag>
            <Tag color={currentCleric.isActive ? 'success' : 'default'}>
              {currentCleric.isActive ? t('common.active') : t('common.inactive')}
            </Tag>
          </Space>
        </div>

        {/* Important Dates Grid */}
        <div className="mb-6">
          <Title level={4} className="mb-4 flex items-center">
            <CalendarOutlined className="mr-2" />
            {t('cleric.importantDates')}
          </Title>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{t('cleric.birthDate')}</div>
              <div className="font-medium">{formatDate(currentCleric.birthDate)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{t('cleric.monasticismDate')}</div>
              <div className="font-medium">{formatDate(currentCleric.monasticismDate)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{t('cleric.episcopacyDate')}</div>
              <div className="font-medium">{formatDate(currentCleric.episcopacyDate)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{t('cleric.patriarchateDate')}</div>
              <div className="font-medium">{formatDate(currentCleric.patriarchateDate)}</div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="mb-6">
          <Title level={4} className="mb-4">
            {t('cleric.biography')}
          </Title>
          <Paragraph className="text-gray-700 leading-relaxed">
            {i18n.language === 'ar' && currentCleric.bio_arabic
              ? currentCleric.bio_arabic
              : currentCleric.bio || t('cleric.noBiography')}
          </Paragraph>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/clerics/${id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('cleric.confirmDeleteCleric', { name: getClericName() })}
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
    </div>
  );
}
