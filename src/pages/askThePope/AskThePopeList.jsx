import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchAskThePopeQuestions,
  deleteAskThePopeQuestion,
  setPage,
  setLimit,
} from '@/store/askThePopeSlice';

const { Text } = Typography;

const AskThePopeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { questions, loading, deleting, page, limit, total } = useSelector((state) => state.askThePope);

  useEffect(() => {
    dispatch(fetchAskThePopeQuestions({ page, limit }));
  }, [dispatch, page, limit]);

  const handleDelete = (question) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('askThePope.deleteConfirm', { name: question.name }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteAskThePopeQuestion(question.id)).unwrap();
          const isLastItemOnPage = questions.length === 1;
          if (isLastItemOnPage && page > 1) {
            dispatch(setPage(page - 1));
          } else {
            dispatch(fetchAskThePopeQuestions({ page, limit }));
          }
          message.success(t('askThePope.deleteSuccess'));
        } catch (error) {
          message.error(t('askThePope.deleteError'));
        }
      },
    });
  };

  const columns = [
    {
      title: t('askThePope.question'),
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: t('askThePope.name'),
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: t('askThePope.phoneNumber'),
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 180,
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('askThePope.email'),
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
      render: (value) => value || t('common.notAvailable'),
    },
    {
      title: t('askThePope.public'),
      dataIndex: 'public',
      key: 'public',
      width: 120,
      render: (value) => (
        <Tag color={value ? 'success' : 'default'}>
          {value ? t('common.yes') : t('common.no')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('common.view')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/ask-the-pope/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              loading={deleting}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{t('askThePope.title')}</h2>
        </div>

        <Table
          columns={columns}
          dataSource={questions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (newPage, newLimit) => {
              if (newLimit !== limit) {
                dispatch(setLimit(newLimit));
                return;
              }
              dispatch(setPage(newPage));
            },
            // showSizeChanger: true,
            // pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>
    </div>
  );
};

export default AskThePopeList;
