import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Switch, Button, Card, message, Space, DatePicker, Radio } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { updateUser, fetchUser, createUser } from '@/store/usersSlice';
import { getDirtyValues } from '@/lib/formUtils';
import dayjs from 'dayjs';

const { Option } = Select;

const UserForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = !!id;
  const { currentUser, loading, updating, creating } = useSelector((state) => state.users);

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchUser(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentUser) {
      form.setFieldsValue({
        email: currentUser.email,
        phone_number: currentUser.phone_number,
        firstName: currentUser.userDetails?.firstName,
        lastName: currentUser.userDetails?.lastName,
        gender: currentUser.userDetails?.gender,
        // date_of_birth: currentUser.userDetails?.date_of_birth ? dayjs(currentUser.userDetails.date_of_birth) : null,
        active: currentUser.active,
        // verified: currentUser.verified,
        blocked: currentUser.blocked,
        dob: currentUser.dob ? dayjs(currentUser.dob) : null,
        role_id: currentUser.roleDetails?.id,
      });
    }
  }, [currentUser, form, isEditing]);

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        active: true,
        dob: values.dob ? values.dob.toISOString() : null,
      };

      if (isEditing) {
        const initial = {
          email: currentUser.email || '',
          phone_number: currentUser.phone_number || '',
          firstName: currentUser.userDetails?.firstName || '',
          lastName: currentUser.userDetails?.lastName || '',
          gender: currentUser.userDetails?.gender || '',
          active: true,
          blocked: currentUser.blocked ?? false,
          dob: currentUser.dob || null,
          role_id: currentUser.roleDetails?.id || undefined,
        };
        const payload = getDirtyValues(submitData, initial);
        if (Object.keys(payload).length === 0) {
          message.success(t('users.updateSuccess'));
          navigate('/users');
          return;
        }
        await dispatch(updateUser({ id, data: payload })).unwrap();
        message.success(t('users.updateSuccess'));
      } else {
        await dispatch(createUser(submitData)).unwrap();
        message.success(t('users.createSuccess'));
      }
      navigate('/users');
    } catch (error) {
      message.error(isEditing ? t('users.updateError') : t('users.createError'));
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            {t('common.back')}
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEditing ? t('users.edit') : t('users.create')}
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            gender: 'male',
            active: true,
            // verified: false,
            // blocked: false,
            role: 1, // Default to Admin role
          }}
        >
          {/* Basic Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3>{t('users.basicInfo')}</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Form.Item
                name="firstName"
                label={t('users.firstName')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { min: 2, message: t('validation.minLength', { min: 2 }) },
                  { max: 50, message: t('validation.maxLength', { max: 50 }) },
                ]}
                style={{ flex: 1, minWidth: 200 }}
              >
                <Input placeholder={t('users.firstNamePlaceholder')} />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={t('users.lastName')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { min: 2, message: t('validation.minLength', { min: 2 }) },
                  { max: 50, message: t('validation.maxLength', { max: 50 }) },
                ]}
                style={{ flex: 1, minWidth: 200 }}
              >
                <Input placeholder={t('users.lastNamePlaceholder')} />
              </Form.Item>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3>{t('users.contactInfo')}</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Form.Item
                name="email"
                label={t('users.email')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { type: 'email', message: t('validation.email') },
                ]}
                style={{ flex: 1, minWidth: 250 }}
              >
                <Input placeholder={t('users.emailPlaceholder')} />
              </Form.Item>

              <Form.Item
                name="phone_number"
                label={t('users.phone')}
                rules={[
                  { 
                    pattern: /^\d{11}$/, 
                    message: 'Phone number must be exactly 11 digits' 
                  }
                ]}
                style={{ flex: 1, minWidth: 200 }}
              >
                <Input 
                  placeholder={t('users.phonePlaceholder')} 
                  maxLength={11}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Personal Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3>{t('users.personalDetails')}</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Form.Item
                name="gender"
                label={t('users.gender')}
                rules={[{ required: true, message: t('validation.required') }]}
                style={{ flex: 1, minWidth: 150 }}
              >
                <Radio.Group>
                  <Radio value="male">{t('users.male')}</Radio>
                  <Radio value="female">{t('users.female')}</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="dob"
                label={t('users.dateOfBirth')}
                style={{ flex: 1, minWidth: 200 }}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder={t('users.dateOfBirthPlaceholder')}
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label={t('users.role')}
                rules={[{ required: true, message: t('validation.required') }]}
                style={{ flex: 1, minWidth: 150 }}
              >
                <Select placeholder={t('users.selectRole')}>
                  <Option value={1}>{t('users.admin')}</Option>
                  <Option value={2}>{t('users.guest')}</Option>
                  {/* <Option value={3}>{t('users.user')}</Option>
                  <Option value={4}>{t('users.superAdmin')}</Option> */}
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Account Status (only for editing) */}
          {isEditing && (
            <div style={{ marginBottom: '24px' }}>
              <h3>{t('users.accountStatus')}</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Form.Item
                  name="active"
                  label={t('users.active')}
                  valuePropName="checked"
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <Switch />
                </Form.Item>

                {/* <Form.Item
                  name="verified"
                  label={t('users.verified')}
                  valuePropName="checked"
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <Switch />
                </Form.Item> */}
{/* 
                <Form.Item
                  name="blocked"
                  label={t('users.blocked')}
                  valuePropName="checked"
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <Switch />
                </Form.Item> */}
              </div>
            </div>
          )}

          {/* Password field only for create */}
          {!isEditing && (
            <div style={{ marginBottom: '24px' }}>
              <h3>{t('users.security')}</h3>
              <Form.Item
                name="password"
                label={t('users.password')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { min: 6, message: t('validation.minLength', { min: 6 }) },
                ]}
              >
                <Input.Password placeholder={t('users.passwordPlaceholder')} />
              </Form.Item>
            </div>
          )}

          <Form.Item style={{ marginTop: '32px' }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updating || creating}
              >
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserForm;
