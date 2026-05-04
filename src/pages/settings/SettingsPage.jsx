import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, message, Card, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import apiService from '@/services/apiService';

const DEFAULT_SETTINGS = {
  id: null,
  social_links: [],
  verse_of_day: '',
  easter_date: '',
};

const normalizeSocialLinks = (socialLinks) => {
  if (Array.isArray(socialLinks)) {
    return socialLinks;
  }

  if (typeof socialLinks === 'string') {
    try {
      const parsed = JSON.parse(socialLinks);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing social_links:', error);
      return [];
    }
  }

  return [];
};

const normalizeSettings = (payload) => {
  const rawSettings = payload?.data ?? payload ?? {};

  return {
    ...DEFAULT_SETTINGS,
    ...rawSettings,
    social_links: normalizeSocialLinks(rawSettings.social_links),
    easter_date: rawSettings.easter_date ?? '',
    verse_of_day: rawSettings.verse_of_day ?? '',
  };
};

const normalizeUrl = (url = '') => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [form] = Form.useForm();
  const [generalForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/settings');
      const normalizedSettings = normalizeSettings(response.data);
      setSettings(normalizedSettings);
      generalForm.setFieldsValue({
        verse_of_day: normalizedSettings.verse_of_day,
        easter_date: normalizedSettings.easter_date ? dayjs(normalizedSettings.easter_date) : null,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      message.error(t('settings.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const patchSettings = async (updates, successMessage) => {
    const payload = {
      social_links: settings.social_links,
      verse_of_day: settings.verse_of_day,
      easter_date: settings.easter_date || null,
      ...updates,
    };

    const response = await apiService.patch('/settings', payload);
    const nextSettings = normalizeSettings(response?.data?.data ? response.data : { data: payload });

    setSettings(nextSettings);
    generalForm.setFieldsValue({
      verse_of_day: nextSettings.verse_of_day,
      easter_date: nextSettings.easter_date ? dayjs(nextSettings.easter_date) : null,
    });

    if (successMessage) {
      message.success(successMessage);
    }
  };

  const handleViewDetails = () => {
    setDetailModalVisible(true);
  };

  const handleAddLink = () => {
    setAddModalVisible(true);
    setEditingLink(null);
    form.resetFields();
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    setAddModalVisible(true);
    form.setFieldsValue(link);
  };

  const handleDeleteLink = async (linkToDelete) => {
    try {
      const updatedLinks = settings.social_links.filter((link) => link.platform !== linkToDelete.platform);
      await patchSettings({ social_links: updatedLinks }, t('settings.deleteSuccess'));
    } catch (error) {
      console.error('Failed to delete social link:', error);
      message.error(t('settings.deleteError'));
    }
  };

  const handleSaveLink = async (values) => {
    try {
      const nextLink = { ...values, url: normalizeUrl(values.url) };

      const updatedLinks = editingLink
        ? settings.social_links.map((link) =>
            link.platform === editingLink.platform ? nextLink : link
          )
        : [...settings.social_links, nextLink];

      await patchSettings(
        { social_links: updatedLinks },
        editingLink ? t('settings.updateSuccess') : t('settings.createSuccess')
      );

      setAddModalVisible(false);
      setEditingLink(null);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save social link:', error);
      message.error(t('settings.saveError'));
    }
  };

  const handleSaveGeneralSettings = async (values) => {
    try {
      setSavingGeneral(true);
      await patchSettings(
        {
          verse_of_day: values.verse_of_day,
          easter_date: values.easter_date ? values.easter_date.format('YYYY-MM-DD') : null,
        },
        t('settings.generalSaveSuccess')
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error(t('settings.generalSaveError'));
    } finally {
      setSavingGeneral(false);
    }
  };

  const columns = [
    {
      title: t('settings.title'),
      dataIndex: 'social_links',
      key: 'social_links',
      render: () => (
        <div>
          <strong>{t('settings.socialMediaLinks')}</strong>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
            {settings.social_links.length} {t('settings.linksConfigured')}
          </div>
        </div>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: () => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={handleViewDetails}
            title={t('common.view')}
          />
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: t('settings.platform'),
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => <strong>{platform}</strong>,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
          {url}
        </a>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditLink(record)}
            title={t('common.edit')}
          />
          <Popconfirm
            title={t('settings.deleteConfirm')}
            onConfirm={() => handleDeleteLink(record)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title={t('common.delete')}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2>{t('settings.generalTitle')}</h2>
        </div>

        <Form
          form={generalForm}
          layout="vertical"
          onFinish={handleSaveGeneralSettings}
        >
          <Form.Item
            name="verse_of_day"
            label={t('settings.verseOfDay')}
            rules={[{ required: true, message: t('settings.verseRequired') }]}
          >
            <Input.TextArea
              data-testid="verse-of-day-input"
              rows={4}
              placeholder={t('settings.versePlaceholder')}
              dir="rtl"
            />
          </Form.Item>

          <Form.Item
            name="easter_date"
            label={t('settings.easterDate')}
            rules={[{ required: true, message: t('settings.easterDateRequired') }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={savingGeneral}
          >
            {t('common.save')}
          </Button>
        </Form>
      </Card>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('settings.socialMediaLinks')}</h2>
        </div>

        <Table
          columns={columns}
          dataSource={[{ key: 'social_links' }]}
          rowKey="key"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={t('settings.detailsTitle')}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            {t('common.close')}
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddLink}>
            {t('settings.addNewLink')}
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={detailColumns}
          dataSource={settings.social_links}
          rowKey="platform"
          pagination={false}
          size="middle"
        />
      </Modal>

      <Modal
        title={editingLink ? t('settings.editLink') : t('settings.addLink')}
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          setEditingLink(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveLink}
        >
          <Form.Item
            name="platform"
            label={t('settings.platform')}
            rules={[{ required: true, message: t('settings.platformRequired') }]}
          >
            <Input placeholder={t('settings.platformPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: t('settings.urlRequired') },
              {
                validator: (_, value) => {
                  if (!value) return Promise.reject(new Error(t('settings.urlRequired')));

                  const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
                  if (!urlPattern.test(value)) {
                    return Promise.reject(new Error(t('settings.urlInvalid')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder={t('settings.urlPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
