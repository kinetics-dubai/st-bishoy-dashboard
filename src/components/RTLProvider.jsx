import { ConfigProvider } from 'antd';
import { useDirection } from '@/hooks/useDirection';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';

export function RTLProvider({ children }) {
  const { direction, language } = useDirection();

  // Configure locale based on language
  const locale = language === 'ar' ? arEG : enUS;

  // Configure font family based on direction
  const fontFamily = direction === 'rtl' 
    ? "'Noto Sans Arabic', 'Cairo', 'Tahoma', sans-serif"
    : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return (
    <ConfigProvider
      direction={direction}
      locale={locale}
      theme={{
        token: {
          colorPrimary: '#5C1A1B',
          colorInfo: '#5C1A1B',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          fontFamily: fontFamily,
          fontSize: 16,
          // RTL-specific adjustments
          ...(direction === 'rtl' && {
            marginXS: 8,
            marginSM: 12,
            marginMD: 16,
            marginLG: 24,
            marginXL: 32,
          }),
        },
        components: {
          Card: {
            borderRadiusLG: 8,
            boxShadowTertiary: '0 4px 6px rgba(0, 0, 0, 0.05)',
          },
          Table: {
            borderRadiusLG: 8,
            // RTL table adjustments
            ...(direction === 'rtl' && {
              headerBg: '#fafafa',
            }),
          },
          Button: {
            borderRadius: 8,
          },
          Menu: {
            darkItemSelectedBg: '#5C1A1B',
            darkItemSelectedColor: '#ffffff',
            darkItemBg: '#f6f1e7',
            darkItemColor: '#5C1A1B',
            // RTL menu adjustments
            ...(direction === 'rtl' && {
              itemBg: '#ffffff',
              itemSelectedBg: '#5C1A1B',
              itemSelectedColor: '#ffffff',
            }),
          },
          Form: {
            // RTL form adjustments
            ...(direction === 'rtl' && {
              itemMarginBottom: 24,
              verticalLabelPadding: '0 0 8px',
            }),
          },
          Input: {
            // RTL input adjustments
            ...(direction === 'rtl' && {
              paddingInline: 12,
            }),
          },
          Select: {
            // RTL select adjustments
            ...(direction === 'rtl' && {
              optionPadding: '8px 12px',
            }),
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
