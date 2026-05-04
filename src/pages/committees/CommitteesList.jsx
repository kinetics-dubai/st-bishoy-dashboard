import { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Empty, 
  Card,
  Typography,
  Tag,
  Input
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCommittees, deleteCommittee, clearError, setPage, setLimit } from '@/store/committeesSlice';
import { format } from 'date-fns';

const { Title } = Typography;

export default function CommitteesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { committees, loading, error, deleting, page, limit, total } = useSelector((state) => state.committees);

  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousSearchRef = useRef('');

  // Debounce search to trigger after 3 characters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length >= 3) {
        setSearchDebounce(searchText);
      } else if (searchText.length === 0) {
        setSearchDebounce('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const searchChanged = previousSearchRef.current !== searchDebounce;
    previousSearchRef.current = searchDebounce;

    if (searchChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchCommittees({ 
      page, 
      limit, 
      search: searchDebounce
    }));
  }, [dispatch, page, limit, searchDebounce]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCommittee(id)).unwrap();
      message.success(t('committee.committeeDeleted'));
    } catch (error) {
      const errorMessage = error?.message || error?.detail || t('common.error');
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: t('committee.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => 
        i18n.language === 'ar' && record.name_ar ? record.name_ar : text,
    },
    {
      title: t('committee.description'),
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        const description = i18n.language === 'ar' && record.description_ar 
          ? record.description_ar 
          : text;
        return description ? (
          <span title={description}>
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </span>
        ) : '-';
      },
    },
    {
      title: t('common.createdDate'),
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/committees/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/committees/${record.id}/edit`)}
            title={t('common.edit')}
          />
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('committee.confirmDeleteCommittee', { name: record.name })}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            okButtonProps={{ loading: deleting }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title={t('common.delete')}
              loading={deleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <Empty
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => dispatch(fetchCommittees())}>
            {t('common.retry')}
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">
          {t('committee.pageTitle')}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/committees/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {t('committee.createTitle')}
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          placeholder={t('committee.searchPlaceholder') || 'Search committees...'}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<TeamOutlined />}
          style={{ width: '100%' }}
        />
      </div>

      <Card>
        {!committees.length && !loading ? (
          <Empty
            image={<TeamOutlined style={{ fontSize: 64 }} className="text-gray-400 mx-auto" />}
            description={t('committee.noCommittees')}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/committees/create')}
            >
              {t('committee.createFirstCommittee')}
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={committees}
            rowKey="id"
            loading={loading || deleting}
            pagination={{
              current: page,
              pageSize: limit,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: (_, newLimit) => handleLimitChange(newLimit),
              showSizeChanger: false,
              showQuickJumper: false,
            }}
          />
        )}
      </Card>
    </div>
  );
}
