import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  Input,
  message,
  Empty,
} from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Users, Search } from 'lucide-react';
import { fetchMonks, deleteMonk, setPage, setLimit } from '@/store/monksSlice';
import CenteredLoader from '@/components/CenteredLoader';
import { getRankLabel } from '@/lib/ranks';

export default function MonksList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { monks, loading, error, deleting, page, limit, total } = useSelector((state) => state.monks);

  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousSearchRef = useRef('');

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

    dispatch(fetchMonks({ page, limit, search: searchDebounce }));
  }, [dispatch, page, limit, searchDebounce]);

  const getMonkName = (monk) => {
    return i18n.language === 'ar' && monk.name_ar ? monk.name_ar : monk.name;
  };

  const getMonkPosition = (monk) => {
    return i18n.language === 'ar' && monk.position_ar ? monk.position_ar : monk.position;
  };

  const getMonkRank = (monk) => {
    return monk.rank ? getRankLabel(t, monk.rank) : t('common.notAvailable');
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteMonk(id)).unwrap();
      message.success(t('monk.monkDeleted'));
    } catch (submitError) {
      message.error(submitError?.message || submitError?.detail || t('common.error'));
    }
  };

  const columns = [
    {
      title: t('monk.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => getMonkName(record) || t('common.notAvailable'),
    },
    {
      title: t('monk.position'),
      dataIndex: 'position',
      key: 'position',
      render: (_, record) => getMonkPosition(record) || t('common.notAvailable'),
    },
    {
      title: t('monk.rank'),
      dataIndex: 'rank',
      key: 'rank',
      render: (_, record) => getMonkRank(record),
    },
    {
      title: t('monk.departed'),
      dataIndex: 'departed',
      key: 'departed',
      render: (departed) => (
        <Tag color={departed ? 'default' : 'success'}>
          {departed ? t('monk.departedYes') : t('monk.departedNo')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/monks/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/monks/${record.id}/edit`)} />
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('monk.confirmDeleteMonk', { name: getMonkName(record) })}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            okButtonProps={{ loading: deleting }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} loading={deleting} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => dispatch(fetchMonks({ page, limit }))}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={24} color="#5C1A1B" />
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#5C1A1B' }}>
                {t('navigation.monks')}
              </span>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/monks/create')} style={{ background: '#5C1A1B' }}>
              {t('navigation.createMonk')}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder={t('monk.searchPlaceholder')}
            allowClear
            style={{ flex: 1, minWidth: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
          {searchText && (
            <Button onClick={() => setSearchText('')}>
              {t('monk.clearFilters')}
            </Button>
          )}
        </div>

        {loading && !monks.length ? (
          <CenteredLoader minHeight={320} />
        ) : monks.length > 0 ? (
          <Table
            dataSource={monks}
            columns={columns}
            rowKey="id"
            loading={loading || deleting}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              onChange: (nextPage, nextLimit) => {
                if (nextLimit !== limit) {
                  dispatch(setLimit(nextLimit));
                  return;
                }
                dispatch(setPage(nextPage));
              },
            }}
          />
        ) : (
          <Empty
            description={t('common.empty')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/monks/create')} style={{ background: '#5C1A1B' }}>
              {t('navigation.createMonk')}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
