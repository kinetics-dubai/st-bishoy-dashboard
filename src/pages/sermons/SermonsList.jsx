import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Table, Button, Space, Popconfirm, Empty, Input, message, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SoundOutlined } from '@ant-design/icons';
import { Search } from 'lucide-react';
import { fetchSermons, deleteSermon, setSermonsPage, setSermonsLimit } from '@/store/sermonsSlice';
import CenteredLoader from '@/components/CenteredLoader';
import dayjs from 'dayjs';

export default function SermonsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { sermons, loading, error, deleting, page, limit, total } = useSelector((state) => state.sermons);

  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const previousSearchRef = useRef('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length >= 3) setSearchDebounce(searchText);
      else if (searchText.length === 0) setSearchDebounce('');
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const searchChanged = previousSearchRef.current !== searchDebounce;
    previousSearchRef.current = searchDebounce;
    if (searchChanged && page !== 1) {
      dispatch(setSermonsPage(1));
      return;
    }
    dispatch(fetchSermons({ page, limit, search: searchDebounce }));
  }, [dispatch, page, limit, searchDebounce]);

  const getTitle = (record) =>
    i18n.language === 'ar' && record.title_ar ? record.title_ar : record.title;

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSermon(id)).unwrap();
      message.success(t('sermons.deleteSuccess'));
    } catch (err) {
      message.error(err?.message || err?.detail || t('common.error'));
    }
  };

  const columns = [
    {
      title: t('sermons.title'),
      key: 'title',
      render: (_, record) => getTitle(record) || t('common.notAvailable'),
    },
    {
      title: t('sermons.date'),
      key: 'date',
      render: (_, record) =>
        record.date ? dayjs(record.date).format('YYYY-MM-DD') : t('common.notAvailable'),
    },
    {
      title: t('sermons.video_url'),
      key: 'video_url',
      ellipsis: true,
      render: (_, record) =>
        record.video_url ? (
          <a href={record.video_url} target="_blank" rel="noopener noreferrer">
            {record.video_url}
          </a>
        ) : (
          t('common.notAvailable')
        ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/sermons/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/sermons/${record.id}/edit`)} />
          <Popconfirm
            title={t('common.confirmDelete')}
            description={t('sermons.deleteConfirm', { title: getTitle(record) })}
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
            <Button type="primary" onClick={() => dispatch(fetchSermons({ page, limit }))}>
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
              <SoundOutlined style={{ fontSize: 24, color: '#6B1A1A' }} />
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#6B1A1A' }}>
                {t('navigation.sermons')}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/sermons/create')}
              style={{ background: '#6B1A1A' }}
            >
              {t('sermons.create')}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder={t('sermons.searchPlaceholder')}
            allowClear
            style={{ flex: 1, minWidth: 300, maxWidth: 400 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </div>

        {loading && !sermons.length ? (
          <CenteredLoader minHeight={320} />
        ) : sermons.length > 0 ? (
          <Table
            dataSource={sermons}
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
                  dispatch(setSermonsLimit(nextLimit));
                  return;
                }
                dispatch(setSermonsPage(nextPage));
              },
            }}
          />
        ) : (
          <Empty description={t('common.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/sermons/create')}
              style={{ background: '#6B1A1A' }}
            >
              {t('sermons.create')}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
