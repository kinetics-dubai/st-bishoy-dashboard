import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  deleteSynaxarium,
  fetchSynaxariums,
  setSynaxariumLimit,
  setSynaxariumPage,
} from '@/store/synaxariumSlice';

const SynaxariumList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { synaxariums, loading, deleting, page, limit, total } = useSelector((state) => state.synaxarium);

  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const previousFiltersRef = useRef({
    synaxariumDate: '',
    statusFilter: 'all',
  });

  useEffect(() => {
    const synaxariumDate = dateFilter ? dayjs(dateFilter).format('YYYY-MM-DD') : '';
    const filtersChanged =
      previousFiltersRef.current.synaxariumDate !== synaxariumDate ||
      previousFiltersRef.current.statusFilter !== statusFilter;

    previousFiltersRef.current = {
      synaxariumDate,
      statusFilter,
    };

    if (filtersChanged && page !== 1) {
      dispatch(setSynaxariumPage(1));
      return;
    }

    dispatch(
      fetchSynaxariums({
        page,
        limit,
        synaxarium_date: synaxariumDate || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter,
      })
    );
  }, [dateFilter, dispatch, limit, page, statusFilter]);

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('synaxarium.deleteConfirm', {
        date: record?.synaxarium_date || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteSynaxarium(record.id)).unwrap();
          message.success(t('synaxarium.deleteSuccess'));
        } catch (error) {
          message.error(t('synaxarium.deleteError'));
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t('synaxarium.id'),
        dataIndex: 'id',
        key: 'id',
        width: 90,
      },
      {
        title: t('synaxarium.date'),
        dataIndex: 'synaxarium_date',
        key: 'synaxarium_date',
        render: (value) => <strong>{value || t('common.notAvailable')}</strong>,
      },
      {
        title: t('common.status'),
        dataIndex: 'isActive',
        key: 'isActive',
        width: 120,
        render: (isActive) => (
          <Tag color={isActive ? 'success' : 'default'}>
            {isActive ? t('common.active') : t('common.inactive')}
          </Tag>
        ),
      },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 160,
        render: (_, record) => (
          <Space size="small">
            <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/synaxarium/${record.id}`)} />
            <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/synaxarium/${record.id}/edit`)} />
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
    ],
    [deleting, navigate, t]
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0 }}>{t('synaxarium.title')}</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/synaxarium/create')}>
            {t('synaxarium.create')}
          </Button>
        </div>

        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Space size="small" align="center">
            <FilterOutlined style={{ color: '#5C1A1B' }} />
            <span>{t('common.filter')}</span>
          </Space>

          <DatePicker
            allowClear
            format="YYYY-MM-DD"
            placeholder={t('synaxarium.filterDate')}
            value={dateFilter}
            onChange={setDateFilter}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ minWidth: 180 }}
            options={[
              { value: 'all', label: t('common.allStatuses') },
              { value: 'true', label: t('common.active') },
              { value: 'false', label: t('common.inactive') },
            ]}
          />
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={synaxariums}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (nextPage) => dispatch(setSynaxariumPage(nextPage)),
            onShowSizeChange: (_, nextLimit) => dispatch(setSynaxariumLimit(nextLimit)),
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};

export default SynaxariumList;
