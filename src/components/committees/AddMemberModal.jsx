import { useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  Button,
  message,
  Space
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClerics } from '@/store/clericsSlice';
import { addCommitteeMember } from '@/store/committeesSlice';

const { Option } = Select;

export default function AddMemberModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  committeeId, 
  existingMembers = [] 
}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { clerics, loading: clericsLoading } = useSelector((state) => state.clerics);
  const { addingMember } = useSelector((state) => state.committees);

  useEffect(() => {
    if (visible) {
      dispatch(fetchClerics());
      form.resetFields();
    }
  }, [dispatch, visible, form]);

  // Filter out clerics who are already members of this committee
  const availableClerics = clerics.filter(cleric => 
    !existingMembers.some(member => member.cleric_id === cleric.id)
  );

  const handleSubmit = async (values) => {
    try {
      const data = {
        cleric_id: values.cleric_id,
        position: values.position,
        committeeId,
      };

      await dispatch(addCommitteeMember({
        ...data,
      })).unwrap();
        
      message.success(t('committee.memberAdded'));
      form.resetFields();
      onSuccess();
    } catch (error) {
      const errorMessage = error?.message || error?.detail || t('common.error');
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('committee.addMember')}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="cleric_id"
          label={t('committee.selectCleric')}
          rules={[
            { required: true, message: t('validation.required') },
          ]}
        >
          <Select
            placeholder={t('committee.selectCleric')}
            loading={clericsLoading}
            showSearch
            filterOption={(input, option) => {
              const cleric = availableClerics.find(c => c.id === option.value);
              if (!cleric) return false;
              const searchText = `${cleric.name} ${t(`cleric.ranks.${cleric.rank}`)}`.toLowerCase();
              return searchText.indexOf(input.toLowerCase()) >= 0;
            }}
          >
            {availableClerics.map(cleric => (
              <Option key={cleric.id} value={cleric.id}>
                {cleric.name} - {t(`cleric.ranks.${cleric.rank}`)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="position"
          label={t('committee.positionEn')}
          rules={[
            { required: true, message: t('validation.required') },
            { max: 100, message: t('validation.maxLength', { max: 100 }) },
          ]}
        >
          <Input placeholder={t('committee.positionEn')} />
        </Form.Item>

        <Form.Item
          name="position_ar"
          label={t('committee.positionAr')}
          rules={[
            { required: true, message: t('validation.required') },
            { max: 100, message: t('validation.maxLength', { max: 100 }) },
          ]}
        >
          <Input placeholder={t('committee.positionAr')} dir="rtl" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addingMember}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('committee.addMember')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
