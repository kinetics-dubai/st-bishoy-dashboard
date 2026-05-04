import { Button } from 'antd';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PlaceholderPage({ title }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-100 rounded-full">
            <Construction size={48} className="text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title} - {t('common.comingSoon')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          This module is under development and will be available soon.
        </p>
        
        <Button 
          type="primary" 
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {t('common.back')} {t('navigation.dashboard')}
        </Button>
      </div>
    </div>
  );
}
