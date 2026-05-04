import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/providers/AuthProvider';
import { setRedirectAfterLogin } from '@/store/authSlice';
import apiService from '@/services/apiService';
import logo from '/assets/logo.png';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfterLogin = useSelector((state) => state.auth.redirectAfterLogin);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const response = await apiService.post('/users/login', {
        email: values.email,
        password: values.password
      });
      
      const { user, accessToken } = response.data;
      const destination =
        location.state?.from?.pathname || redirectAfterLogin || '/dashboard';
      
      // Save and redirect
      login(user, accessToken);
      if (redirectAfterLogin) {
        dispatch(setRedirectAfterLogin(null));
      }
      message.success(t('login.loginSuccess'));
      navigate(destination, { replace: true });
      
    } catch (error) {
      message.error(t('login.loginFailed') + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div 
      style={{ 
        // minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '16px'
      }}
    >
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '448px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Church Logo */}
          <img 
            src={logo} 
            alt="Church Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              margin: '0 auto 16px',
              display: 'block'
            }} 
          />
          <Title level={2} style={{ marginBottom: '8px', color: '#4A2E1F' }}>{t('login.title')}</Title>
          <Text type="secondary">{t('login.subtitle')}</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
          // initialValues={{
          //   email: 'test1@test.com',
          //   password: 'Test1234',
          // }}
        >
          <Form.Item
            label={t('login.email')}
            name="email"
            rules={[
              { required: true, message: t('login.emailRequired') },
              { type: 'email', message: t('login.emailInvalid') },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#64748b' }} />}
              placeholder={t('login.emailPlaceholder')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={t('login.password')}
            name="password"
            rules={[{ required: true, message: t('login.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#64748b' }} />}
              placeholder={t('login.passwordPlaceholder')}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ 
                marginTop: '16px',
                background: '#B68B3A',
                borderColor: '#B68B3A',
                color: '#ffffff',
                height: '48px',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              {t('login.signIn')}
            </Button>
          </Form.Item>
        </Form>

        {/* <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          <Text type="secondary">
            Demo credentials: test1@test.com / Test1234
          </Text>
        </div> */}
      </Card>
    </div>
  );
}
