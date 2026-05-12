import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Tag, Button, Space, Descriptions, Typography, message, Spin, Avatar, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchUser, deleteUser } from '@/store/usersSlice';
import { getApiErrorMessage } from '@/lib/apiError';

const { Title, Paragraph } = Typography;

const UserDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { currentUser, loading, deleting } = useSelector((state) => state.users);

  useEffect(() => {
    if (id) {
      dispatch(fetchUser(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('users.deleteConfirm', { 
        name: `${currentUser?.userDetails?.firstName} ${currentUser?.userDetails?.lastName}` 
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteUser(id)).unwrap();
          message.success(t('users.deleteSuccess'));
          navigate('/users');
        } catch (error) {
          message.error(getApiErrorMessage(error, t('users.deleteError')));
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>{t('users.notFound')}</Title>
            <Button type="primary" onClick={() => navigate('/users')}>
              {t('users.backToList')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getRoleColor = (roleName) => {
    const colors = {
      'Admin': 'red',
      'Guest': 'blue',
      'User': 'green',
      'Super Admin': 'purple'
    };
    return colors[roleName] || 'default';
  };

  const getStatusColor = (user) => {
    if (user.blocked) return 'error';
    if (!user.active) return 'default';
    if (user.verified) return 'success';
    return 'warning';
  };

  const getStatusText = (user) => {
    if (user.blocked) return t('users.blocked');
    if (!user.active) return t('users.inactive');
    if (user.verified) return t('users.verified');
    return t('users.unverified');
  };

  const fullName = `${currentUser.userDetails?.firstName || ''} ${currentUser.userDetails?.lastName || ''}`.trim();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/users')}
            >
              {t('common.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {t('users.details')}
            </Title>
          </div>
          
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              {t('common.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
            >
              {t('common.delete')}
            </Button>
          </Space>
        </div>

        {/* User Profile Card */}
        <div style={{ background: '#f5f5f5', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Avatar 
              size={80} 
              src={currentUser.userDetails?.profilePicture}
              icon={<UserOutlined />}
            />
            <div>
              <Title level={3} style={{ margin: '0 0 8px 0' }}>
                {fullName || t('users.noName')}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <MailOutlined />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneOutlined />
                  <span>{currentUser.phone_number}</span>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Tag color={getRoleColor(currentUser.roleDetails?.name)}>
              {currentUser.roleDetails?.name || t('common.notAvailable')}
            </Tag>
            <Tag color={getStatusColor(currentUser)}>
              {getStatusText(currentUser)}
            </Tag>
            <Tag color={currentUser.userDetails?.gender === 'male' ? 'blue' : 'pink'}>
              {currentUser.userDetails?.gender === 'male' ? t('users.male') : t('users.female')}
            </Tag>
          </div>
        </div>

        {/* Detailed Information */}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label={t('users.userId')}>
            <code>{currentUser.id}</code>
          </Descriptions.Item>
          <Descriptions.Item label={t('users.email')}>
            {currentUser.email}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.firstName')}>
            {currentUser.userDetails?.firstName || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.lastName')}>
            {currentUser.userDetails?.lastName || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.phone')}>
            {currentUser.phone_number || t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.role')}>
            <Tag color={getRoleColor(currentUser.roleDetails?.name)}>
              {currentUser.roleDetails?.name || t('common.notAvailable')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('users.gender')}>
            {currentUser.userDetails?.gender === 'male' ? t('users.male') : 
             currentUser.userDetails?.gender === 'female' ? t('users.female') : 
             t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.dateOfBirth')}>
            {currentUser.userDetails?.date_of_birth ? 
              new Date(currentUser.userDetails.date_of_birth).toLocaleDateString() : 
              t('common.notAvailable')}
          </Descriptions.Item>
          <Descriptions.Item label={t('users.accountStatus')}>
            <Tag color={getStatusColor(currentUser)}>
              {getStatusText(currentUser)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('users.active')}>
            <Tag color={currentUser.active ? 'success' : 'default'}>
              {currentUser.active ? t('common.yes') : t('common.no')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('users.verified')}>
            <Tag color={currentUser.verified ? 'success' : 'warning'}>
              {currentUser.verified ? t('common.yes') : t('common.no')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('users.blocked')}>
            <Tag color={currentUser.blocked ? 'error' : 'success'}>
              {currentUser.blocked ? t('common.yes') : t('common.no')}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserDetail;
