import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ReadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createVerseGroup, updateVerseGroup, fetchVerseGroup } from '@/store/booksSlice';

const VerseGroupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = Boolean(id);
  const { currentVerseGroup, verseGroupsLoading, creatingVerseGroup, updatingVerseGroup } = useSelector((state) => state.books);
  const chapterId = searchParams.get('chapter_id') || currentVerseGroup?.chapter_id;

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchVerseGroup(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentVerseGroup) {
      form.setFieldsValue({
        start_verse: currentVerseGroup.start_verse,
        end_verse: currentVerseGroup.end_verse,
        verse_content: currentVerseGroup.verse_content,
        commentary: currentVerseGroup.commentary,
      });
    }
  }, [currentVerseGroup, form, isEditing]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        chapter_id: Number(chapterId),
      };

      if (isEditing) {
        await dispatch(updateVerseGroup({ id, data: payload })).unwrap();
        message.success(t('bible.updateVerseGroupSuccess'));
      } else {
        await dispatch(createVerseGroup(payload)).unwrap();
        message.success(t('bible.createVerseGroupSuccess'));
      }

      navigate(`/bible/chapters/${chapterId}`);
    } catch (error) {
      message.error(isEditing ? t('bible.updateVerseGroupError') : t('bible.createVerseGroupError'));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card loading={verseGroupsLoading && isEditing}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ReadOutlined style={{ color: '#5C1A1B' }} />
            <h2 style={{ margin: 0 }}>
              {isEditing ? t('bible.editVerseGroup') : t('bible.createVerseGroup')}
            </h2>
          </div>

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/bible/chapters/${chapterId}`)}
          >
            {t('common.back')}
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '900px' }}
        >
          <Space size={16} style={{ display: 'flex' }}>
            <Form.Item
              label={t('bible.startVerse')}
              name="start_verse"
              rules={[{ required: true, message: t('bible.startVerseRequired') }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label={t('bible.endVerse')}
              name="end_verse"
              rules={[{ required: true, message: t('bible.endVerseRequired') }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item
            label={t('bible.verseContent')}
            name="verse_content"
            rules={[{ required: true, message: t('bible.verseContentRequired') }]}
          >
            <Input.TextArea rows={5} placeholder={t('bible.verseContentPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('bible.commentary')}
            name="commentary"
            rules={[{ required: true, message: t('bible.commentaryRequired') }]}
          >
            <Input.TextArea rows={6} placeholder={t('bible.commentaryPlaceholder')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={creatingVerseGroup || updatingVerseGroup}
                style={{ background: '#5C1A1B', border: 'none' }}
              >
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
              <Button type="default" onClick={() => navigate(`/bible/chapters/${chapterId}`)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default VerseGroupForm;
