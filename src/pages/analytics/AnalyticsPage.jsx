import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Badge, Tag, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  FileText,
  Home,
  Tags,
  BookOpen,
  Church,
  User,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import apiService from '@/services/apiService';
import CenteredLoader from '@/components/CenteredLoader';

// Coptic Church Color Palette
const COLORS = {
  primary: '#5C1A1B',      // Deep Coptic Red
  secondary: '#B7884F',    // Gold/Bronze
  accent: '#D4AF37',       // Gold
  success: '#52c41a',      // Green
  warning: '#fa8c16',      // Orange
  error: '#ff4d4f',        // Red
  info: '#1890ff',         // Blue
  purple: '#722ed1',       // Purple
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await apiService.get('/analytics');
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <CenteredLoader minHeight="calc(100vh - 220px)" />;
  }

  // Real data from API
  const statsData = [
    {
      title: t('analyticsPage.totalUsers'),
      value: analyticsData?.usersCount || 0,
      icon: <Users size={24} color={COLORS.primary} />,
      trend: '+12%',
      status: 'success',
      detail: t('analyticsPage.activeMembers')
    },
    {
      title: t('analyticsPage.articles'),
      value: analyticsData?.articlesCount || 0,
      icon: <FileText size={24} color={COLORS.info} />,
      trend: '+8%',
      status: 'success',
      detail: t('analyticsPage.publishedContent')
    },
    {
      title: t('analyticsPage.entities'),
      value: analyticsData?.entitiesCount || 0,
      icon: <Home size={24} color={COLORS.warning} />,
      trend: '+3%',
      status: 'processing',
      detail: t('analyticsPage.churchLocations')
    },
    {
      title: t('analyticsPage.tags'),
      value: analyticsData?.tagsCount || 0,
      icon: <Tags size={24} color={COLORS.purple} />,
      trend: '+15%',
      status: 'success',
      detail: t('analyticsPage.contentCategories')
    }
  ];

  const contentStats = [
    {
      title: t('analyticsPage.magazines'),
      value: analyticsData?.magazineReleasesCount || 0,
      icon: <BookOpen size={20} color={COLORS.secondary} />,
      total: 15,
      color: COLORS.secondary
    },
    {
      title: t('analyticsPage.papalDecisions'),
      value: analyticsData?.magazineReleasesCount || 0,
      icon: <Church size={20} color={COLORS.primary} />,
      total: 80,
      color: COLORS.primary
    },
    {
      title: t('analyticsPage.faqs'),
      value: analyticsData?.faqsCount || 0,
      icon: <CheckCircle size={20} color={COLORS.success} />,
      total: 50,
      color: COLORS.success
    },
    {
      title: t('analyticsPage.committees'),
      value: analyticsData?.committeesCount || 0,
      icon: <Users size={20} color={COLORS.info} />,
      total: 30,
      color: COLORS.info
    }
  ];

  // Transform logHistory for recent activity
  const recentActivity = analyticsData?.logHistory?.filter(log => log).map(log => ({
    action: `${log.operation} ${log.tableName} #${log.record}`,
    time: log.user?.email || 'Unknown user',
    type: log.operation,
    user: log.user?.email,
    tableName: log.tableName,
    recordId: log.record
  })) || [];

  const systemHealth = [
    { metric: t('analyticsPage.serverUptime'), value: 99.8, status: 'success' },
    { metric: t('analyticsPage.responseTime'), value: 245, status: 'success', unit: 'ms' },
    { metric: t('analyticsPage.storageUsed'), value: 67, status: 'warning', unit: '%' },
    { metric: t('analyticsPage.activeSessions'), value: analyticsData?.usersCount || 0, status: 'success' }
  ];

  const getTrendColor = (status) => {
    switch (status) {
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.info;
    }
  };

  const getProgressColor = (value) => {
    if (value >= 80) return COLORS.error;
    if (value >= 60) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Church size={32} color={COLORS.primary} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: COLORS.primary,
            margin: 0,
          }}>
            {t('analytics.title')}
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '16px', marginLeft: '44px' }}>
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* Main Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {statsData?.filter(stat => stat).map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `1px solid ${COLORS.primary}20`,
                height: '140px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{ 
                padding: '24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${COLORS.primary}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                    {stat.title}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.primary }}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {/* <Tag color={stat.status} style={{ fontSize: '12px', margin: 0 }}>
                      <TrendingUp size={12} style={{ marginRight: '4px' }} />
                      {stat.trend}
                    </Tag> */}
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      {stat.detail}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Content Management Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color={COLORS.primary} />
                <span>{t('analyticsPage.contentOverview')}</span>
              </div>
            }
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Row gutter={[16, 16]}>
              {contentStats?.filter(item => item).map((item, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `${item.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: item.color }}>
                      {item.value}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
                      {item.title}
                    </div>
                    <Progress
                      percent={Math.round((item.value / item.total) * 100)}
                      size="small"
                      strokeColor={item.color}
                      showInfo={false}
                    />
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                      {item.value} of {item.total}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color={COLORS.primary} />
                <span>{t('analyticsPage.recentActivity')}</span>
              </div>
            }
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentActivity?.filter(activity => activity).map((activity, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 0',
                    borderBottom: index < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activity.type === 'create' ? COLORS.success : 
                               activity.type === 'update' ? COLORS.warning : 
                               activity.type === 'delete' ? COLORS.error : COLORS.primary,
                    flexShrink: 0,
                    marginTop: '6px'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#262626', marginBottom: '4px' }}>
                      <strong>{activity.user}</strong> {activity.action}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {activity.tableName} • Record #{activity.recordId}
                    </div>
                  </div>
                  <Tag 
                    color={activity.type === 'create' ? 'success' : 
                           activity.type === 'update' ? 'warning' : 
                           activity.type === 'delete' ? 'error' : 'default'}
                    style={{ fontSize: '10px', textTransform: 'uppercase' }}
                  >
                    {activity.type}
                  </Tag>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  {t('analyticsPage.noRecentActivity')}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
}
