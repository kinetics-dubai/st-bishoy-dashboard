import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Empty, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { deleteEntity, fetchEntities, setPage } from '@/store/entitiesSlice';
import { PAGE_SIZE } from '@/lib/queryHelper';
import CenteredLoader from '@/components/CenteredLoader';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const { Text, Title } = Typography;

export default function EntitiesList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { entities, loading, deleting, error, page, total } = useSelector((state) => state.entities);

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

    dispatch(fetchEntities({ page, search: searchDebounce }));
  }, [dispatch, page, searchDebounce]);

  useEffect(() => {
    if (error) {
      message.error(error?.message || error?.detail || t('entities.fetchError'));
    }
  }, [error, t]);

  const getDisplayName = (entity) => {
    return i18n.language === 'ar' && entity.name_ar ? entity.name_ar : entity.name;
  };

  const handleDelete = (entity) => {
    message.info(t('entities.deleteCascadeNotice'));
    dispatch(deleteEntity(entity.id))
      .unwrap()
      .then(() => {
        message.success(t('entities.deleteSuccess'));
      })
      .catch(() => {
        message.error(t('entities.deleteError'));
      });
  };

  const columns = [
    {
      title: t('entities.thumbnail'),
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 90,
      render: (thumbnail, record) => (
        <Avatar
          shape="square"
          size={52}
          src={resolveMediaUrl(thumbnail)}
          icon={<HomeOutlined />}
          alt={getDisplayName(record)}
        />
      ),
    },
    {
      title: t('entities.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div>
          <Text
            strong
            style={{ display: 'block', fontSize: '16px', cursor: 'pointer' }}
            onClick={() => navigate(`/entities/${record.id}`)}
          >
            {getDisplayName(record) || t('common.notAvailable')}
          </Text>
          <Text type="secondary">#{record.id}</Text>
        </div>
      ),
    },
    {
      title: t('entities.childrenCount'),
      dataIndex: 'childrenCount',
      key: 'childrenCount',
      render: (count) => count ?? 0,
    },
    {
      title: t('entities.hasDetails'),
      dataIndex: 'hasDetails',
      key: 'hasDetails',
      render: (hasDetails) => (
        <Tag color={hasDetails ? 'success' : 'default'}>
          {hasDetails ? t('common.yes') : t('common.no')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/entities/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/entities/${record.id}/edit`)} />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleting}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HomeOutlined style={{ color: '#6B1A1A' }} />
              {t('entities.title')}
            </Title>
          </div>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/entities/create')}>
            {t('entities.create')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
            <Search size={16} style={{ position: 'absolute', top: 11, left: 12, color: '#999', zIndex: 1 }} />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t('entities.searchPlaceholder')}
              style={{
                width: '100%',
                height: 40,
                padding: '0 12px 0 36px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
              }}
            />
          </div>
          {searchText && (
            <Button onClick={() => setSearchText('')}>
              {t('entities.clearFilters')}
            </Button>
          )}
        </div>

        {loading && !entities.length ? (
          <CenteredLoader minHeight={320} />
        ) : entities.length > 0 ? (
          <Table
            dataSource={entities.map((entity) => ({ ...entity, children: undefined }))}
            columns={columns}
            rowKey="id"
            loading={loading || deleting}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total,
              showSizeChanger: false,
              onChange: (nextPage) => dispatch(setPage(nextPage)),
            }}
          />
        ) : (
          <Empty description={t('common.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/entities/create')}>
              {t('entities.create')}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
