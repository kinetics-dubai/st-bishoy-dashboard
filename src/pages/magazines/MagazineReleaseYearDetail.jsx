import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, DatePicker, Empty, Form, Input, Modal, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, BookOutlined, CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined, TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import apiService from '@/services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const initialReleaseForm = {
  issue_label: '',
  issue_date: null,
  release_date: null,
  title: '',
  description: '',
  cover_photo: '',
  file: '',
  slug: '',
};

const getArabicLanguageId = (languages = []) =>
  languages.find((language) => {
    const abbr = String(language?.abbr || '').toLowerCase();
    const name = String(language?.name || '').toLowerCase();
    return abbr === 'ar' || name === 'arabic';
  })?.id || null;

const MagazineReleaseYearDetail = () => {
  const navigate = useNavigate();
  const { id, releaseYearId } = useParams();
  const { t } = useTranslation();
  const [releaseForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [releaseYearData, setReleaseYearData] = useState(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [savingRelease, setSavingRelease] = useState(false);
  const [deletingReleaseId, setDeletingReleaseId] = useState(null);

  const loadReleaseYearData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/magazine-release-years/${releaseYearId}`);
      const data = response.data?.data || response.data;
      setReleaseYearData(data || null);
    } catch (error) {
      message.error(t('magazines.fetchError'));
      setReleaseYearData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (releaseYearId) {
      loadReleaseYearData();
    }
  }, [releaseYearId]);

  const releases = useMemo(() => releaseYearData?.releases || [], [releaseYearData]);

  const openCreateReleaseModal = () => {
    setEditingRelease(null);
    releaseForm.setFieldsValue({
      ...initialReleaseForm,
      release_date: releaseYearData?.release_year
        ? dayjs(`${releaseYearData.release_year}-01-01`)
        : null,
    });
    setIsReleaseModalOpen(true);
  };

  const openEditReleaseModal = (release) => {
    setEditingRelease(release);
    releaseForm.setFieldsValue({
      issue_label: release.issue_label || '',
      issue_date: release.issue_date ? dayjs(release.issue_date) : null,
      release_date: release.release_date ? dayjs(release.release_date) : null,
      title: release.title || '',
      description: release.description || '',
      cover_photo: release.cover_photo || '',
      file: release.file || '',
      slug: release.slug || '',
    });
    setIsReleaseModalOpen(true);
  };

  const closeReleaseModal = () => {
    setIsReleaseModalOpen(false);
    setEditingRelease(null);
    releaseForm.resetFields();
  };

  const handleSaveRelease = async () => {
    if (!releaseYearData?.id) return;

    try {
      const values = await releaseForm.validateFields();
      setSavingRelease(true);

      const payload = {
        issue_label: values.issue_label,
        issue_date: values.issue_date?.format('YYYY-MM-DD'),
        release_date: values.release_date?.format('YYYY-MM-DD'),
        description: values.description,
        slug: values.slug,
      };

      if (values.release_date?.year() !== Number(releaseYearData.release_year)) {
        message.error(t('magazines.releaseYearDateOnlyError', { year: releaseYearData.release_year }));
        return;
      }

      if (editingRelease?.id) {
        await apiService.patch(`/magazine-releases/${editingRelease.id}`, payload);
        message.success(t('magazines.releaseUpdateSuccess'));
      } else {
        const releaseResponse = await apiService.post('/magazine-releases', {
          magazine_release_year_id: releaseYearData.id,
          title: values.title,
          cover_photo: values.cover_photo,
          file: values.file,
          ...payload,
        });

        const createdRelease = releaseResponse.data?.data || releaseResponse.data;
        const languagesResponse = await apiService.get('/Languages/get-Languages', {
          params: { limit: 1000 },
          skipAuthReset: true,
        });
        const languages = languagesResponse.data?.Languages || [];
        const arabicLanguageId = getArabicLanguageId(languages);

        if (createdRelease?.id && arabicLanguageId) {
          try {
            await apiService.post('/magazine-release-translations', {
              magazine_release_id: createdRelease.id,
              language_id: arabicLanguageId,
              title: values.title,
              cover_photo: values.cover_photo,
              file: values.file,
            }, {
              skipAuthReset: true,
            });
          } catch (translationError) {
            message.warning(t('magazines.defaultArabicTranslationCreateError'));
          }
        }

        message.success(t('magazines.releaseCreateSuccess'));
      }

      closeReleaseModal();
      loadReleaseYearData();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(t('magazines.releaseSaveError'));
    } finally {
      setSavingRelease(false);
    }
  };

  const handleDeleteRelease = (release) => {
    Modal.confirm({
      title: t('magazines.deleteRelease'),
      content: t('magazines.deleteReleaseConfirm', {
        title: release.issue_label || release.slug || `#${release.id}`,
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          setDeletingReleaseId(release.id);
          await apiService.delete(`/magazine-releases/${release.id}`);
          message.success(t('magazines.releaseDeleteSuccess'));
          loadReleaseYearData();
        } catch (error) {
          message.error(t('magazines.releaseDeleteError'));
        } finally {
          setDeletingReleaseId(null);
        }
      },
    });
  };

  const releaseColumns = [
    {
      title: t('magazines.issueLabel'),
      dataIndex: 'issue_label',
      key: 'issue_label',
      render: (value) => <Text strong>{value || t('common.notAvailable')}</Text>,
    },
    {
      title: t('magazines.description'),
      dataIndex: 'description',
      key: 'description',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('translations.title'),
      key: 'translationsCount',
      render: (_, record) => record?.translations?.length || 0,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 320,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<TranslationOutlined />}
            onClick={() =>
              navigate(
                `/magazines/${id}/release-years/${releaseYearId}/releases/${record.id}/translations`
              )
            }
          >
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditReleaseModal(record)}
          >
            {t('common.edit')}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletingReleaseId === record.id}
            onClick={() => handleDeleteRelease(record)}
          >
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!releaseYearData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description={t('magazines.notFound')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => navigate(`/magazines/${id}`)}>
              {t('common.back')}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/magazines/${id}`)}>
              {t('common.back')}
            </Button>
            <div>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOutlined style={{ color: '#5C1A1B' }} />
                {t('magazines.releaseYearDetails')}
              </Title>
              <Text type="secondary">
                {releaseYearData?.magazine?.title || t('common.notAvailable')} - {releaseYearData.release_year}
              </Text>
            </div>
          </div>

          <Space>

            <Tag color={releaseYearData.isActive ? 'success' : 'default'}>
              {releaseYearData.isActive ? t('magazines.active') : t('magazines.inactive')}
            </Tag>
            <Tag icon={<CalendarOutlined />}>
              {releaseYearData.publishedAt ? dayjs(releaseYearData.publishedAt).format('DD MMM YYYY') : t('common.notAvailable')}
            </Tag>
          </Space>
        </div>
        <div className='flex justify-end mb-5'>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateReleaseModal}>
            {t('magazines.addRelease')}
          </Button>
        </div>
        <Table
          columns={releaseColumns}
          dataSource={releases}
          rowKey="id"
          locale={{ emptyText: t('magazines.noReleases') }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingRelease ? t('magazines.editRelease') : t('magazines.addRelease')}
        open={isReleaseModalOpen}
        onOk={handleSaveRelease}
        onCancel={closeReleaseModal}
        confirmLoading={savingRelease}
        okText={editingRelease ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={releaseForm} layout="vertical" initialValues={initialReleaseForm}>
          {!editingRelease && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={t('magazines.defaultArabicTranslationNotice')}
            />
          )}

          <Form.Item
            name="issue_label"
            label={t('magazines.issueLabel')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder="49 & 50 - 53" />
          </Form.Item>

          <Form.Item
            name="release_date"
            label={t('magazines.releaseDate')}
            rules={[
              { required: true, message: t('validation.required') },
              {
                validator: (_, value) => {
                  if (!value || value.year() === Number(releaseYearData?.release_year)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      t('magazines.releaseYearDateOnlyError', {
                        year: releaseYearData?.release_year,
                      })
                    )
                  );
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) =>
                !!current && current.year() !== Number(releaseYearData?.release_year)
              }
            />
          </Form.Item>

          {!editingRelease && (
            <Form.Item
              name="title"
              label={t('magazines.releaseTitle')}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label={t('magazines.description')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          {!editingRelease && (
            <Form.Item
              name="cover_photo"
              label={t('magazines.coverPhotoUrl')}
              rules={[
                { required: true, message: t('validation.required') },
                { type: 'url', message: t('validation.url') },
              ]}
            >
              <Input placeholder="https://example.com/kiraza/2025/cover.jpg" />
            </Form.Item>
          )}

          {!editingRelease && (
            <Form.Item
              name="file"
              label={t('magazines.translationFile')}
              rules={[
                { required: true, message: t('validation.required') },
                { type: 'url', message: t('validation.url') },
              ]}
            >
              <Input placeholder="https://example.com/kiraza/2025/kiraza-49-50-53.pdf" />
            </Form.Item>
          )}



          <Form.Item
            name="issue_date"
            label={t('magazines.issueDate')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MagazineReleaseYearDetail;
