import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Modal, message, Input, Image, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchMagazines, deleteMagazine, clearError } from '@/store/magazinesSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const MagazinesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { magazines, loading, deleting, error } = useSelector((state) => state.magazines);
  
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchMagazines());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(t('magazines.fetchError'));
    }
  }, [error, t]);

  const handleDelete = (magazine) => {
    Modal.confirm({
      title: t('magazines.deleteConfirm'),
      content: t('magazines.deleteConfirmMessage', { title: magazine.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteMagazine(magazine.id)).unwrap();
          message.success(t('magazines.deleteSuccess'));
        } catch (error) {
          message.error(t('magazines.deleteError'));
        }
      },
    });
  };

  const getFilteredMagazines = () => {
    return magazines.filter(magazine => {
      const searchMatch = !searchText || 
        magazine.title.toLowerCase().includes(searchText.toLowerCase()) ||
        magazine.description.toLowerCase().includes(searchText.toLowerCase());
      
      return searchMatch;
    });
  };

  const columns = [
    {
      title: t('magazines.cover'),
      dataIndex: 'cover_photo',
      key: 'cover_photo',
      render: (coverPhoto, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            width={60}
            height={80}
            src={coverPhoto}
            alt={record.title}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioaOAjDJiGPjf0aMIjYU85I4TZBwS0pQyIhT4B4HqOIbRkHqJpEqNJ8AAY+FkXQxAAAAAElFTkSuQmCC"
            preview={{
              mask: <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
                {t('common.view')}
              </div>
            }}
          />
          <div>
            <Text strong style={{ display: 'block', maxWidth: '200px' }}>
              {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              {t('magazines.id')}: #{record.id}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: t('magazines.description'),
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: t('common.more') }}
          style={{ margin: 0, maxWidth: '300px' }}
        >
          {description || t('common.notAvailable')}
        </Paragraph>
      ),
    },
    {
      title: t('magazines.publishedAt'),
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date) => (
        <div>
          <Text strong>{dayjs(date).format('DD MMM YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/magazines/${record.id}`)}
            title={t('common.view')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/magazines/${record.id}/edit`)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleting}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  const filteredMagazines = getFilteredMagazines();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOutlined style={{ color: '#5C1A1B' }} />
              {t('magazines.title')}
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/magazines/create')}
          >
            {t('magazines.create')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredMagazines}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
          rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        />
      </Card>

      <style>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        .ant-image-preview-mask {
          background-color: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
};

export default MagazinesList;
