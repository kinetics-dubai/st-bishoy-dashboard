import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Table,
  Popconfirm,
  Typography,
  Space,
  Badge,
  Avatar,
  message,
  Empty,
  Tag,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import AddMemberModal from '@/components/committees/AddMemberModal';
import {
  fetchCommittee,
  deleteCommittee,
  removeCommitteeMember,
} from '@/store/committeesSlice';
import { fetchClerics } from '@/store/clericsSlice';

const { Title, Paragraph } = Typography;

export default function CommitteeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { currentCommittee, loading, removingMember } = useSelector((state) => state.committees);
  const { clerics } = useSelector((state) => state.clerics);
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCommittee(id));
      dispatch(fetchClerics());
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteCommittee(id)).unwrap();
      message.success(t('committee.committeeDeleted'));
      navigate('/committees');
    } catch (error) {
      message.error(error.message || t('common.error'));
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await dispatch(removeCommitteeMember(memberId)).unwrap();
      message.success(t('committee.memberRemoved'));
      dispatch(fetchCommittee(id)); // Refresh committee data
    } catch (error) {
      message.error(error.message || t('common.error'));
    }
  };

  const handleMemberAdded = () => {
    setIsMemberModalOpen(false);
    dispatch(fetchCommittee(id)); // Refresh committee data
  };

  const getClericInfo = (clericId) => {
    const cleric = clerics.find(c => c.id === clericId);
    return cleric || {};
  };

  const memberColumns = [
    {
      title: t('committee.cleric'),
      key: 'cleric',
      render: (_, record) => {
        const cleric = getClericInfo(record.cleric_id);
        return (
          <Space>
            <Avatar 
              src={cleric.picture} 
              icon={<UserOutlined />}
              size="small"
            >
              {!cleric.picture && cleric.name?.charAt(0)}
            </Avatar>
            <div>
              <div className="font-medium">
                {i18n.language === 'ar' && cleric.name_ar ? cleric.name_ar : cleric.name}
              </div>
              <div className="text-sm text-gray-500">
                {t(`cleric.ranks.${cleric.rank}`)}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: t('committee.position'),
      dataIndex: i18n.language === 'ar' ? 'position_ar' : 'position',
      key: 'position',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title={t('common.confirmDelete')}
          description={t('committee.confirmRemoveMember')}
          onConfirm={() => handleRemoveMember(record.id)}
          okText={t('common.yes')}
          cancelText={t('common.no')}
          okButtonProps={{ loading: removingMember }}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            title={t('committee.removeMember')}
            loading={removingMember}
          />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return <div className="p-6">{t('common.loading')}</div>;
  }

  if (!currentCommittee) {
    return (
      <div className="p-6">
        <Empty description={t('error.notFound')} />
      </div>
    );
  }

  const displayName = i18n.language === 'ar' && currentCommittee.name_ar
    ? currentCommittee.name_ar
    : currentCommittee.name;

  const displayDescription = i18n.language === 'ar' && currentCommittee.description_ar
    ? currentCommittee.description_ar
    : currentCommittee.description;

  const membersCount = currentCommittee.committee_members?.length || 0;

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/committees')}
            className="mr-4"
          >
            {t('common.back')}
          </Button>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Title level={1} className="m-0 mb-2">
              {displayName}
            </Title>
            {displayDescription && (
              <Paragraph className="text-gray-600 text-lg mb-4">
                {displayDescription}
              </Paragraph>
            )}
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/committees/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('common.edit')}
              </Button>
              <Popconfirm
                title={t('common.confirmDelete')}
                description={t('committee.confirmDeleteCommittee', { name: displayName })}
                onConfirm={handleDelete}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TeamOutlined className="mr-2" />
            <Title level={3} className="!m-0">
              {t('committee.members')}
            </Title>
            <Badge 
              count={membersCount} 
              className="ml-2" 
              style={{ backgroundColor: '#1890ff' }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsMemberModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('committee.addMember')}
          </Button>
        </div>

        {membersCount > 0 ? (
          <Table
            dataSource={currentCommittee.committee_members}
            columns={memberColumns}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty
            image={<TeamOutlined style={{ fontSize: 64 }} className="text-gray-400 mx-auto" />}
            description={t('committee.noMembers')}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsMemberModalOpen(true)}
            >
              {t('committee.addMember')}
            </Button>
          </Empty>
        )}
      </Card>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={isMemberModalOpen}
        onCancel={() => setIsMemberModalOpen(false)}
        onSuccess={handleMemberAdded}
        committeeId={id}
        existingMembers={currentCommittee.committee_members || []}
      />
    </div>
  );
}
