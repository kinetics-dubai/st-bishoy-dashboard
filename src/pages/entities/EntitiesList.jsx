import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteEntity, fetchEntities, setLimit, setPage } from '@/store/entitiesSlice';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const categoryOptions = ['diocese', 'monastery', 'organization'];

const EntitiesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { entities, loading, deleting, error, page, limit, total } = useSelector((state) => state.entities);

  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const previousFiltersRef = useRef({
    searchDebounce: '',
    categoryFilter: null,
  });

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
      previousFiltersRef.current.categoryFilter !== categoryFilter;

    previousFiltersRef.current = { searchDebounce, categoryFilter };

    if (filtersChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(
      fetchEntities({
        page,
        limit,
        search: searchDebounce,
        category: categoryFilter,
      })
    );
  }, [categoryFilter, dispatch, limit, page, searchDebounce]);

  useEffect(() => {
    if (error) {
      message.error(t('entities.fetchError'));
    }
  }, [error, t]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'diocese':
        return 'purple';
      case 'monastery':
        return 'gold';
      case 'organization':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'diocese':
        return t('entities.diocese');
      case 'monastery':
        return t('entities.monastery');
      case 'organization':
        return t('entities.organization');
      default:
        return category || t('common.notAvailable');
    }
  };

  const handleDelete = (entity) => {
    Modal.confirm({
      title: t('entities.deleteConfirm'),
      content: t('entities.deleteConfirmMessage', {
        name: entity?.name || entity?.slug || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteEntity(entity.id)).unwrap();
          message.success(t('entities.deleteSuccess'));
          dispatch(
            fetchEntities({
              page,
              limit,
              search: searchDebounce,
              category: categoryFilter,
            })
          );
        } catch (submitError) {
          message.error(t('entities.deleteError'));
        }
      },
    });
  };

  const entityStats = useMemo(() => {
    const safeEntities = entities || [];
    return {
      activeCount: safeEntities.filter((entity) => entity?.isActive).length,
      inactiveCount: safeEntities.filter((entity) => entity && !entity.isActive).length,
      translationsMissing: safeEntities.filter((entity) => entity?.translation_missing).length,
    };
  }, [entities]);

  const columns = [
    {
      title: t('entities.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space size={12}>
          <Avatar shape="square" size={48} src={record.logo} icon={<HomeOutlined />} />
          <div>
            <Text
              strong
              style={{ display: 'block', fontSize: '16px', cursor: 'pointer' }}
              onClick={() => navigate(`/entities/${record.slug}`)}
            >
              {record.name || record.slug || t('common.notAvailable')}
            </Text>
            <Text type="secondary">{record.slug || t('common.notAvailable')}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('entities.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)} style={{ padding: '4px 12px', textTransform: 'capitalize' }}>
          {getCategoryText(category)}
        </Tag>
      ),
    },
    {
      title: t('entities.tags'),
      dataIndex: 'tags',
      key: 'tags',
      render: (tags = []) =>
        tags.length ? (
          <Space size={[0, 8]} wrap>
            {tags.map((tag) => (
              <Tag key={tag.id} color="green">
                {tag.name || tag.slug}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">{t('entities.noTags')}</Text>
        ),
    },
    {
      title: t('entities.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? t('entities.active') : t('entities.inactive')}</Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/entities/${record.slug}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/entities/${record.slug}/edit`)} />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleting === record.id || deleting === true}
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
              <HomeOutlined style={{ color: '#5C1A1B' }} />
              {t('entities.title')}
            </Title>
          </div>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/entities/create')}>
            {t('entities.create')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder={t('entities.searchPlaceholder')}
            allowClear
            style={{ flex: 2, minWidth: 280 }}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <Select
            allowClear
            placeholder={t('entities.filterByCategory')}
            style={{ flex: 1, minWidth: 180 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            {categoryOptions.map((category) => (
              <Option key={category} value={category}>
                {getCategoryText(category)}
              </Option>
            ))}
          </Select>
          {(searchText || categoryFilter) && (
            <Button
              onClick={() => {
                setSearchText('');
                setCategoryFilter(null);
              }}
            >
              {t('entities.clearFilters')}
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={entities}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (nextPage, nextLimit) => {
              if (nextLimit !== limit) {
                dispatch(setLimit(nextLimit));
                return;
              }
              dispatch(setPage(nextPage));
            },
            showSizeChanger: true,
          }}
          rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        />
      </Card>

      <style>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
};

export default EntitiesList;
