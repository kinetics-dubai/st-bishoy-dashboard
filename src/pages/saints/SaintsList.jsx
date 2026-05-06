import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Empty, Image, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Church, ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteSaint, fetchSaints, setSaintsLimit, setSaintsPage } from '@/store/saintsSlice';
import CenteredLoader from '@/components/CenteredLoader';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { getRankLabel } from '@/lib/ranks';

const { Text } = Typography;

export default function SaintsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { saints, loading, deleting, error, page, limit, total } = useSelector((state) => state.saints);

  useEffect(() => {
    dispatch(fetchSaints({ page, limit }));
  }, [dispatch, page, limit]);

  const getSaintName = (saint) => {
    return i18n.language === 'ar' && saint.name_ar ? saint.name_ar : saint.name;
  };

  const getSaintRank = (saint) => {
    return saint.rank ? getRankLabel(t, saint.rank) : t('common.notAvailable');
  };

  const handleDelete = async (saint) => {
    try {
      await dispatch(deleteSaint(saint.id)).unwrap();
      message.success(t('saints.deleteSuccess'));
    } catch (submitError) {
      message.error(submitError?.message || submitError?.detail || t('saints.deleteError'));
    }
  };

  const columns = [
    {
      title: t('saints.image'),
      dataIndex: 'image',
      key: 'image',
      width: 92,
      render: (image, record) =>
        image ? (
          <Image
            src={resolveMediaUrl(image)}
            alt={getSaintName(record)}
            width={52}
            height={52}
            style={{ objectFit: 'cover', borderRadius: 10 }}
            fallback=""
          />
        ) : (
          <Avatar size={52} icon={<ImageIcon size={20} />} />
        ),
    },
    {
      title: t('saints.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div>
          <Text strong style={{ display: 'block', fontSize: '15px' }}>
            {getSaintName(record) || t('common.notAvailable')}
          </Text>
          <Text type="secondary">{record.name || t('common.notAvailable')}</Text>
        </div>
      ),
    },
    {
      title: t('saints.rank'),
      dataIndex: 'rank',
      key: 'rank',
      width: 180,
      render: (_, record) => getSaintRank(record),
    },
    {
      title: t('saints.hasDetails'),
      dataIndex: 'hasDetails',
      key: 'hasDetails',
      width: 140,
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
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/saints/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/saints/${record.id}/edit`)} />
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

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => dispatch(fetchSaints({ page, limit }))}>
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
              <Church size={24} color="#5C1A1B" />
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#5C1A1B' }}>
                {t('navigation.saints')}
              </span>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/saints/create')} style={{ background: '#5C1A1B' }}>
              {t('saints.create')}
            </Button>
          </div>
        }
      >
        {loading && !saints.length ? (
          <CenteredLoader minHeight={320} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={saints}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              onChange: (nextPage, nextLimit) => {
                if (nextLimit !== limit) {
                  dispatch(setSaintsLimit(nextLimit));
                  return;
                }
                dispatch(setSaintsPage(nextPage));
              },
            }}
          />
        )}
      </Card>
    </div>
  );
}
