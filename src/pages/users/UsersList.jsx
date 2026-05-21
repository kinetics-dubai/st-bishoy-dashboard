import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Tag, Space, Modal, message, Input, Select, Card, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchUsers, deleteUser, setPage } from '@/store/usersSlice';
import { PAGE_SIZE } from '@/lib/queryHelper';

const { Search } = Input;
const { Option } = Select;

const UsersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { users, loading, deleting, page, total } = useSelector((state) => state.users);

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const previousFiltersRef = useRef({
    searchText: '',
    roleFilter: 'all',
    statusFilter: 'all',
  });

  useEffect(() => {
    const filtersChanged =
      previousFiltersRef.current.searchText !== searchText ||
      previousFiltersRef.current.roleFilter !== roleFilter ||
      previousFiltersRef.current.statusFilter !== statusFilter;

    previousFiltersRef.current = { searchText, roleFilter, statusFilter };

    if (filtersChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }

    dispatch(fetchUsers({
      page,
      search: searchText,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      active: statusFilter !== 'all' ? statusFilter : undefined
    }));
  }, [dispatch, page, searchText, roleFilter, statusFilter]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleDelete = (user) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      content: t('users.deleteConfirm', { name: `${user.userDetails?.firstName} ${user.userDetails?.lastName}` }),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await dispatch(deleteUser(user.id)).unwrap();
          message.success(t('users.deleteSuccess'));
        } catch (error) {
          message.error(t('users.deleteError'));
        }
      },
    });
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const fullName = `${user.userDetails?.firstName || ''} ${user.userDetails?.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const searchMatch = !searchText || 
        fullName.includes(searchText.toLowerCase()) ||
        email.includes(searchText.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.roleDetails?.name === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'true' && user.active) ||
        (statusFilter === 'false' && !user.active);
      
      return searchMatch && matchesRole && matchesStatus;
    });
  };

  const getRoleColor = (roleName) => {
    const colors = {
      'Admin': 'red',
      'Guest': 'blue',
      // 'User': 'green',
      // 'Super Admin': 'purple'
    };
    return colors[roleName] || 'default';
  };

  const getStatusColor = (user) => {
    if (!user.active) return 'default';
    return 'success';
  };

  const getStatusText = (user) => {
    if (!user.active) return t('users.inactive');
    return t('users.active');
  };

  const columns = [
    {
      title: t('users.name'),
      dataIndex: ['userDetails', 'firstName'],
      key: 'name',
      render: (firstName, record) => {
        const lastName = record.userDetails?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return (
          <Space>
            <Avatar
              size="small"
              src={record.userDetails?.profilePicture}
              icon={<UserOutlined />}
            />
            <span>{fullName || t('users.noName')}</span>
          </Space>
        );
      },
    },
    {
      title: t('users.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email) => <span>{email}</span>,
    },
    {
      title: t('users.phone'),
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (phone) => phone || t('common.notAvailable'),
    },
    {
      title: t('users.role'),
      dataIndex: ['roleDetails', 'name'],
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role || t('common.notAvailable')}
        </Tag>
      ),
    },
    {
      title: t('users.gender'),
      dataIndex: ['userDetails', 'gender'],
      key: 'gender',
      render: (gender) => {
        if (!gender) return t('common.notAvailable');
        return gender === 'male' ? t('users.male') : t('users.female');
      },
    },
    {
      title: t('users.status'),
      dataIndex: ['active'],
      key: 'status',
      render: (active) => {
        const statusText = getStatusText({ active });
        return (
          <Tag color={getStatusColor({ active })}>
            {statusText}
          </Tag>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 180,
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/users/${record.id}`)}
              title={t('common.view')}
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/users/${record.id}/edit`)}
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
        );
      },
    },
  ];

  const filteredUsers = getFilteredUsers();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2>{t('users.title')}</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/users/create')}
          >
            {t('users.create')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder={t('users.searchPlaceholder')}
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />

          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 150 }}
            placeholder={t('users.filterByRole')}
          >
            <Option value="all">{t('users.allRoles')}</Option>
            <Option value="1">{t('users.admin')}</Option>
            <Option value="2">{t('users.guest')}</Option>
            {/* <Option value="User">{t('users.user')}</Option>
            <Option value="Super Admin">{t('users.superAdmin')}</Option> */}
          </Select>

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            placeholder={t('users.filterByStatus')}
          >
            <Option value="all">{t('users.allStatuses')}</Option>
            <Option value="true">{t('users.active')}</Option>
            <Option value="false">{t('users.inactive')}</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            onChange: handlePageChange,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default UsersList;
