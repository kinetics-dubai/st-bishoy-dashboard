import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Avatar,
  Tag,
  Space,
  Popconfirm,
  Input,
  message,
  Empty,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Users, Search } from 'lucide-react';
import {
  fetchClerics,
  deleteCleric,
  setPage,
  setLimit,
} from '@/store/clericsSlice';
import CenteredLoader from '@/components/CenteredLoader';

const CLERGY_TYPES = [
  "Bishop",
  "Metropolitan", 
  "General Bishop",
  "Pope",
  "Hegumen",
  "Priest",
  "Deacon",
  "Monk",
  "Abbot",
];

const { Option } = Select;

export default function ClericsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { clerics, loading, error, deleting, page, limit, total } = useSelector((state) => state.clerics);

  const [searchText, setSearchText] = useState('');
  const [rankFilter, setRankFilter] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousFiltersRef = useRef({
    searchDebounce: '',
    rankFilter: null,
  });

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
    const filtersChanged =
      previousFiltersRef.current.searchDebounce !== searchDebounce ||
      previousFiltersRef.current.rankFilter !== rankFilter;

    previousFiltersRef.current = { searchDebounce, rankFilter };

    if (filtersChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchClerics({ 
      page, 
      limit, 
      search: searchDebounce,
      includeRanks: rankFilter
    }));
  }, [dispatch, page, limit, searchDebounce, rankFilter]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCleric(id)).unwrap();
      message.success(t('cleric.clericDeleted'));
    } catch (error) {
      const errorMessage = error?.message || error?.detail || t('common.error');
      message.error(errorMessage);
    }
  };

  const getClericName = (cleric) => {
    return i18n.language === 'ar' && cleric.name_ar ? cleric.name_ar : cleric.name;
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const columns = [
    {
      title: t('cleric.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => getClericName(record),
    },
    {
      title: t('cleric.role'),
      dataIndex: 'rank',
      key: 'rank',
      // render: (rank) => t(`cleric.ranks.${rank?.toLowerCase()}`) || rank,
      render: (rank) => rank ? t(`cleric.ranks.${rank}`) : t('common.notAvailable'),
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/clerics/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/clerics/${record.id}/edit`)}
          />
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('cleric.confirmDeleteCleric', { name: getClericName(record) })}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            okButtonProps={{ loading: deleting }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty
            description={error}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => dispatch(fetchClerics())}>
              {t('common.retry')}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={24} color="#5C1A1B" />
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#5C1A1B' }}>
                {t('navigation.clerics')}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/clerics/create')}
              style={{ background: '#5C1A1B' }}
            >
              {t('navigation.createCleric')}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              placeholder={t('cleric.searchPlaceholder') || 'Search clerics...'}
              allowClear
              style={{ flex: 2, minWidth: 300 }}
              prefix={<Search size={16} />}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
            
            <Select
              placeholder={t('cleric.filterByRank')}
              allowClear
              style={{ flex: 1, minWidth: 150 }}
              onChange={setRankFilter}
              value={rankFilter}
            >
              {CLERGY_TYPES.map(type => (
                <Option key={type} value={type}>
                  {t(`clergyTypes.${type}`) || type}
                </Option>
              ))}
            </Select>
            
            {(searchText || rankFilter) && (
              <Button
                onClick={() => {
                  setSearchText('');
                  setRankFilter(null);
                }}
              >
                {t('cleric.clearFilters') || 'Clear Filters'}
              </Button>
            )}
          </div>
        </div>

        {loading && !clerics.length ? (
          <CenteredLoader minHeight={320} />
        ) : clerics.length > 0 ? (
          <Table
            dataSource={clerics}
            columns={columns}
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
        ) : (
          <Empty
            image={<Users size={64} color="#B7884F" />}
            description={t('common.empty')}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/clerics/create')}
              style={{ background: '#5C1A1B' }}
            >
              {t('navigation.createCleric')}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
