import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Modal, Space, Table, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  deleteSaint,
  fetchSaints,
  setSaintsLimit,
  setSaintsPage,
} from '@/store/saintsSlice';

const { Search } = Input;

const SaintsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { saints, loading, deleting, page, limit, total } = useSelector((state) => state.saints);

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
      dispatch(setSaintsPage(1));
      return;
    }

    dispatch(fetchSaints({ page, limit, search: searchDebounce }));
  }, [dispatch, limit, page, searchDebounce]);

  const handleDelete = (saint) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('saints.deleteConfirm', {
        name: saint?.name || saint?.slug || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteSaint(saint.id)).unwrap();
          message.success(t('saints.deleteSuccess'));
        } catch (error) {
          message.error(t('saints.deleteError'));
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t('saints.name'),
        dataIndex: 'name',
        key: 'name',
        render: (value) => <strong>{value || t('common.notAvailable')}</strong>,
      },
      {
        title: t('saints.saintDay'),
        dataIndex: 'saint_day',
        key: 'saint_day',
        render: (value) => value || t('common.notAvailable'),
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
            <Button
              type="text"
              icon={<EyeOutlined />}
              title={t('common.view')}
              onClick={() => navigate(`/saints/${record.id}`)}
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              title={t('common.edit')}
              onClick={() => navigate(`/saints/${record.id}/edit`)}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title={t('common.delete')}
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
          <h2 style={{ margin: 0 }}>{t('saints.title')}</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/saints/create')}>
            {t('saints.create')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Search
            allowClear
            value={searchText}
            placeholder={t('saints.searchPlaceholder')}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ maxWidth: 420 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={saints}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (nextPage) => dispatch(setSaintsPage(nextPage)),
            onShowSizeChange: (_, nextLimit) => dispatch(setSaintsLimit(nextLimit)),
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};

export default SaintsList;
