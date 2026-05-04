import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Space, Typography, Tag, Image, Empty, Spin, Modal, Table, message, Form, InputNumber, Switch } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, BookOutlined, CalendarOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchMagazine,
  deleteMagazine,
  clearCurrentMagazine,
  createMagazineReleaseYear,
  updateMagazineReleaseYear,
} from '@/store/magazinesSlice';
import dayjs from 'dayjs';
import apiService from '@/services/apiService';

const { Title, Text, Paragraph } = Typography;

const MagazineDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [releaseForm] = Form.useForm();
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [togglingReleaseYearId, setTogglingReleaseYearId] = useState(null);
  const [deletingReleaseYearId, setDeletingReleaseYearId] = useState(null);

  const { currentMagazine, loading, deleting, releasing } = useSelector((state) => state.magazines);

  const handleToggleReleaseYearStatus = async (record, nextActive) => {
    try {
      setTogglingReleaseYearId(record.id);
      await dispatch(
        updateMagazineReleaseYear({
          id: record.id,
          data: { isActive: nextActive },
        })
      ).unwrap();

      message.success(t('magazines.releaseStatusUpdateSuccess'));
      dispatch(fetchMagazine(id));
    } catch (error) {
      const fallbackError = error?.message || t('magazines.releaseStatusUpdateError');
      const extractedError = typeof error === 'string'
        ? error
        : error?.message || error?.error || error?.data?.message || fallbackError;
      message.error(extractedError);
    } finally {
      setTogglingReleaseYearId(null);
    }
  };

  const handleDeleteReleaseYear = (record) => {
    Modal.confirm({
      title: t('magazines.deleteReleaseYear'),
      content: t('magazines.deleteReleaseYearConfirm', { year: record.release_year }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          setDeletingReleaseYearId(record.id);
          await apiService.delete(`/magazine-release-years/${record.id}`);
          message.success(t('magazines.releaseYearDeleteSuccess'));
          dispatch(fetchMagazine(id));
        } catch (error) {
          message.error(t('magazines.releaseYearDeleteError'));
        } finally {
          setDeletingReleaseYearId(null);
        }
      },
    });
  };

  const openReleaseModal = () => {
    releaseForm.setFieldsValue({ release_year: dayjs().year() });
    setIsReleaseModalOpen(true);
  };

  const closeReleaseModal = () => {
    setIsReleaseModalOpen(false);
    releaseForm.resetFields();
  };

  const handleCreateReleaseYear = async () => {
    if (!currentMagazine?.id) return;

    try {
      const values = await releaseForm.validateFields();
      const releaseYearValue = Number(values.release_year);
      const alreadyExists = currentMagazine?.release_years?.some(
        (releaseYear) => Number(releaseYear.release_year) === releaseYearValue
      );

      if (alreadyExists) {
        message.error(t('magazines.currentYearAlreadyExists'));
        return;
      }

      await dispatch(
        createMagazineReleaseYear({
          magazine_id: currentMagazine.id,
          release_year: releaseYearValue,
          isActive: true,
        })
      ).unwrap();

      const yearsToDisable = (currentMagazine?.release_years || []).filter(
        (releaseYear) => releaseYear.isActive && Number(releaseYear.release_year) !== releaseYearValue
      );

      if (yearsToDisable.length > 0) {
        await Promise.all(
          yearsToDisable.map((releaseYear) =>
            dispatch(
              updateMagazineReleaseYear({
                id: releaseYear.id,
                data: { isActive: false },
              })
            ).unwrap()
          )
        );
      }

      message.success(t('magazines.releaseSuccess'));
      closeReleaseModal();
      dispatch(fetchMagazine(id));
    } catch (error) {
      if (error?.errorFields) return;
      const fallbackError = error?.message || t('magazines.releaseError');
      const extractedError = typeof error === 'string'
        ? error
        : error?.message || error?.error || error?.data?.message || fallbackError;
      message.error(extractedError);
    }
  };

  const releaseYearColumns = [
    {
      title: t('magazines.releaseYear'),
      dataIndex: 'release_year',
      key: 'release_year',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: t('papalDecisions.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value) => (
        <Tag color={value ? 'success' : 'default'}>
          {value ? t('magazines.active') : t('magazines.inactive')}
        </Tag>
      ),
    },
    {
      title: t('magazines.publishedAt'),
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (value) => value ? dayjs(value).format('DD MMM YYYY') : t('common.notAvailable'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 360,
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/magazines/${id}/release-years/${record.id}`)}>
            {t('magazines.viewReleaseYear')}
          </Button>
          <Switch
            checked={record.isActive}
            loading={togglingReleaseYearId === record.id}
            onChange={(checked) => handleToggleReleaseYearStatus(record, checked)}
            checkedChildren={t('magazines.active')}
            unCheckedChildren={t('magazines.inactive')}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletingReleaseYearId === record.id}
            onClick={() => handleDeleteReleaseYear(record)}
          >
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (id) {
      dispatch(fetchMagazine(id));
    }

    return () => {
      dispatch(clearCurrentMagazine());
    };
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/magazines/${id}/edit`);
  };

  const handleDelete = () => {
    if (!currentMagazine) return;

    Modal.confirm({
      title: t('magazines.deleteConfirm'),
      content: t('magazines.deleteConfirmMessage', { title: currentMagazine.title }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteMagazine(currentMagazine.id)).unwrap();
          navigate('/magazines');
        } catch (error) {
          // Error is handled in the slice
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentMagazine) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty
            description={t('magazines.notFound')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/magazines')}>
              {t('magazines.backToList')}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header Section */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/magazines')}
            >
              {t('common.back')}
            </Button>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOutlined style={{ color: '#5C1A1B' }} />
              {t('magazines.details')}
            </Title>
          </div>
          
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              {t('common.edit')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
            >
              {t('common.delete')}
            </Button>
          </Space>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Cover Image */}
          <div style={{ flex: '0 0 300px' }}>
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                {t('magazines.coverPhoto')}
              </Text>
              <Image
                width="100%"
                height={400}
                src={currentMagazine.cover_photo}
                alt={currentMagazine.title}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioaOAjDJiGPjf0aMIjYU85I4TZBwS0pQyIhT4B4HqOIbRkHqJpEqNJ8AAY+FkXQxAAAAAElFTkSuQmCC"
                preview={{
                  mask: (
                    <div style={{ color: 'white', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '16px' }}>🔍</div>
                      <div>{t('magazines.viewFullImage')}</div>
                    </div>
                  )
                }}
              />
            </div>
          </div>

          {/* Magazine Information */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ color: '#5C1A1B', marginBottom: '8px' }}>
                {currentMagazine.title}
              </Title>
              {/* <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Tag color="blue" icon={<LinkOutlined />}>
                  {t('magazines.slug')}: {currentMagazine.slug}
                </Tag>
                <Tag color="green">
                  {t('magazines.id')}: #{currentMagazine.id}
                </Tag>
              </div> */}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOutlined style={{ color: '#5C1A1B' }} />
                {t('magazines.description')}
              </Title>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                {currentMagazine.description || t('common.notAvailable')}
              </Paragraph>
            </div>

            {/* Publication Details */}
            {/* <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarOutlined style={{ color: '#5C1A1B' }} />
                {t('magazines.publicationDetails')}
              </Title>
              <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Text strong>{t('magazines.publishedAt')}:</Text>
                  <Text>{dayjs(currentMagazine.publishedAt).format('DD MMMM YYYY')}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{t('magazines.publishedTime')}:</Text>
                  <Text>{dayjs(currentMagazine.publishedAt).format('HH:mm:ss')}</Text>
                </div>
              </div>
            </div> */}

            {/* Release Years */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined style={{ color: '#5C1A1B' }} />
                  {t('magazines.releaseYears')}
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openReleaseModal}>
                  {t('magazines.addReleaseYear')}
                </Button>
              </div>
              <Table
                columns={releaseYearColumns}
                dataSource={currentMagazine.release_years || []}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: t('magazines.noReleaseYears') }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Modal
        title={t('magazines.addReleaseYear')}
        open={isReleaseModalOpen}
        onOk={handleCreateReleaseYear}
        onCancel={closeReleaseModal}
        confirmLoading={releasing}
        okText={t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={releaseForm} layout="vertical">
          <Form.Item
            name="release_year"
            label={t('magazines.releaseYear')}
            rules={[
              { required: true, message: t('validation.required') },
              {
                type: 'number',
                min: 1900,
                max: 2100,
                message: t('validation.numberRange', { min: 1900, max: 2100 }),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} precision={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MagazineDetail;
