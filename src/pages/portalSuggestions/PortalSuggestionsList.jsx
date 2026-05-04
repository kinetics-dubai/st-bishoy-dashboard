import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Form, Input, Modal, Space, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  clearPortalSuggestionsError,
  createPortalSuggestion,
  deletePortalSuggestion,
  fetchPortalSuggestions,
  setPortalSuggestionsLimit,
  setPortalSuggestionsPage,
  updatePortalSuggestion,
} from '@/store/portalSuggestionsSlice';

const { TextArea } = Input;

const PortalSuggestionsList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const {
    suggestions,
    loading,
    creating,
    updating,
    deleting,
    error,
    page,
    limit,
    total,
  } = useSelector((state) => state.portalSuggestions);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(null);

  useEffect(() => {
    dispatch(fetchPortalSuggestions({ page, limit }));
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (error) {
      message.error(
        typeof error === 'string' ? error : t('portalSuggestions.fetchError')
      );
      dispatch(clearPortalSuggestionsError());
    }
  }, [dispatch, error, t]);

  const openCreateModal = () => {
    setEditingSuggestion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingSuggestion(record);
    form.setFieldsValue({
      suggestion_text: record.suggestion_text,
      section: record.section,
      phone: record.phone,
      email: record.email,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSuggestion(null);
    form.resetFields();
  };

  const refreshList = async (targetPage = page, targetLimit = limit) => {
    await dispatch(fetchPortalSuggestions({ page: targetPage, limit: targetLimit })).unwrap();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingSuggestion) {
        await dispatch(
          updatePortalSuggestion({ id: editingSuggestion.id, data: values })
        ).unwrap();
        message.success(t('portalSuggestions.updateSuccess'));
      } else {
        await dispatch(createPortalSuggestion(values)).unwrap();
        message.success(t('portalSuggestions.createSuccess'));
      }

      closeModal();
      await refreshList();
    } catch (submitError) {
      if (submitError?.errorFields) {
        return;
      }
      message.error(
        editingSuggestion
          ? t('portalSuggestions.updateError')
          : t('portalSuggestions.createError')
      );
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('portalSuggestions.deleteConfirm', {
        section: record.section || t('common.notAvailable'),
      }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deletePortalSuggestion(record.id)).unwrap();
          message.success(t('portalSuggestions.deleteSuccess'));

          const nextPage =
            suggestions.length === 1 && page > 1 ? page - 1 : page;

          if (nextPage !== page) {
            dispatch(setPortalSuggestionsPage(nextPage));
          } else {
            await refreshList(nextPage);
          }
        } catch (deleteError) {
          message.error(t('portalSuggestions.deleteError'));
        }
      },
    });
  };

  const columns = [
    {
      title: t('portalSuggestions.suggestionText'),
      dataIndex: 'suggestion_text',
      key: 'suggestion_text',
      render: (text) => (
        <span>{text?.length > 120 ? `${text.slice(0, 120)}...` : text}</span>
      ),
    },
    {
      title: t('portalSuggestions.section'),
      dataIndex: 'section',
      key: 'section',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('portalSuggestions.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('portalSuggestions.email'),
      dataIndex: 'email',
      key: 'email',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
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
          <h2>{t('portalSuggestions.title')}</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            {t('portalSuggestions.create')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={suggestions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: false,
            onChange: (nextPage) => dispatch(setPortalSuggestionsPage(nextPage)),
            onShowSizeChange: (_, nextLimit) =>
              dispatch(setPortalSuggestionsLimit(nextLimit)),
          }}
        />
      </Card>

      <Modal
        title={
          editingSuggestion
            ? t('portalSuggestions.edit')
            : t('portalSuggestions.create')
        }
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        okText={editingSuggestion ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="suggestion_text"
            label={t('portalSuggestions.suggestionText')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 3, message: t('validation.minLength', { min: 3 }) },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t('portalSuggestions.suggestionTextPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="section"
            label={t('portalSuggestions.section')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('portalSuggestions.sectionPlaceholder')} />
          </Form.Item>

          <Form.Item name="phone" label={t('portalSuggestions.phone')}>
            <Input placeholder={t('portalSuggestions.phonePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('portalSuggestions.email')}
            rules={[{ type: 'email', message: t('validation.email') }]}
          >
            <Input placeholder={t('portalSuggestions.emailPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PortalSuggestionsList;
