import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Form, Input, Row, Col, Switch, DatePicker, InputNumber, message } from "antd";
import { FileTextOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchEvent,
  createEvent,
  updateEvent,
  clearCurrentEvent,
} from "@/store/eventsSlice";
import { getDirtyValues } from "@/lib/formUtils";
import FormPageLayout from "@/components/FormPageLayout";
import FormSection from "@/components/FormSection";
import RichTextEditor from "@/components/RichTextEditor";
import Base64ImageUpload from "@/components/Base64ImageUpload";

const { TextArea } = Input;

export default function EventForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { currentEvent, creating, updating } = useSelector(
    (state) => state.events,
  );

  const isEditMode = !!slug && !window.location.pathname.includes("/create");

  useEffect(() => {
    if (isEditMode && slug) {
      dispatch(fetchEvent(slug));
    } else {
      dispatch(clearCurrentEvent());
    }
    return () => {
      dispatch(clearCurrentEvent());
    };
  }, [slug, isEditMode, dispatch]);

  useEffect(() => {
    if (currentEvent && isEditMode) {
      form.setFieldsValue({
        title: currentEvent.title || "",
        title_ar: currentEvent.title_ar || "",
        excerpt: currentEvent.excerpt || "",
        excerpt_ar: currentEvent.excerpt_ar || "",
        content: currentEvent.content || "",
        content_ar: currentEvent.content_ar || "",
        cover_image: currentEvent.cover_image || "",
        thumbnail: currentEvent.thumbnail || "",
        start_at: currentEvent.start_at ? dayjs(currentEvent.start_at) : null,
        end_at: currentEvent.end_at ? dayjs(currentEvent.end_at) : null,
        venue: currentEvent.venue || "",
        venue_ar: currentEvent.venue_ar || "",
        is_virtual: Boolean(currentEvent.is_virtual),
        online_link: currentEvent.online_link || "",
        location: currentEvent.location || { lat: null, lng: null },
        published: Boolean(currentEvent.published),
      });
    }
  }, [currentEvent, form, isEditMode]);

  const buildPayload = (values) => ({
    title: values.title?.trim(),
    title_ar: values.title_ar?.trim(),
    excerpt: values.excerpt?.trim() || "",
    excerpt_ar: values.excerpt_ar?.trim() || "",
    content: values.content || "",
    content_ar: values.content_ar || "",
    cover_image: values.cover_image || "",
    thumbnail: values.thumbnail || "",
    start_at: values.start_at ? values.start_at.toISOString() : null,
    end_at: values.end_at ? values.end_at.toISOString() : null,
    venue: values.venue?.trim() || "",
    venue_ar: values.venue_ar?.trim() || "",
    is_virtual: Boolean(values.is_virtual),
    online_link: values.online_link?.trim() || "",
    location:
      values.location?.lat != null && values.location?.lng != null
        ? { lat: Number(values.location.lat), lng: Number(values.location.lng) }
        : null,
    published: Boolean(values.published),
  });

  const handleSubmit = async (values) => {
    try {
      const data = buildPayload(values);

      if (isEditMode) {
        const initial = buildPayload({
          ...currentEvent,
          start_at: currentEvent.start_at ? dayjs(currentEvent.start_at) : null,
          end_at: currentEvent.end_at ? dayjs(currentEvent.end_at) : null,
        });
        const payload = getDirtyValues(data, initial);
        if (Object.keys(payload).length === 0) {
          message.info(t("common.noChanges", "No changes to save"));
          navigate(`/events/${slug}`);
          return;
        }
        await dispatch(updateEvent({ id: currentEvent.id, data: payload })).unwrap();
        message.success(t("events.updateSuccess"));
        navigate(`/events/${currentEvent.slug}`);
      } else {
        await dispatch(createEvent(data)).unwrap();
        message.success(t("events.createSuccess"));
        navigate("/events");
      }
    } catch (error) {
      message.error(error?.message || error?.detail || t("common.error"));
    }
  };

  return (
    <FormPageLayout
      title={isEditMode ? t("events.edit") : t("events.create")}
      subtitle={t("navigation.events")}
      backPath={isEditMode ? `/events/${slug}` : "/events"}
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ published: false, is_virtual: false }}
      >
        {/* Main content section */}
        <FormSection
          icon={<FileTextOutlined />}
          title={t("navigation.events")}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.titleLabel")}
                name="title"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input size="large" placeholder={t("events.titlePlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.titleArLabel")}
                name="title_ar"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input size="large" dir="rtl" placeholder={t("events.titleArPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.excerptLabel")}
                name="excerpt"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <TextArea rows={3} placeholder={t("events.excerptPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.excerptArLabel")}
                name="excerpt_ar"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <TextArea rows={3} dir="rtl" placeholder={t("events.excerptArPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={t("events.contentLabel")}
                name="content"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <RichTextEditor placeholder={t("events.contentPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={t("events.contentArLabel")}
                name="content_ar"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <RichTextEditor rtl={true} placeholder={t("events.contentArPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.coverImageLabel")}
                name="cover_image"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Base64ImageUpload
                  buttonLabel={t("events.uploadCoverImage")}
                  emptyLabel={t("events.noImage")}
                  removeLabel={t("events.removeImage")}
                  errorLabel={t("events.imageProcessError")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.thumbnailLabel")}
                name="thumbnail"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Base64ImageUpload
                  buttonLabel={t("events.uploadThumbnail")}
                  emptyLabel={t("events.noImage")}
                  removeLabel={t("events.removeImage")}
                  errorLabel={t("events.imageProcessError")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.publishedLabel")}
                name="published"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren={t("common.yes")}
                  unCheckedChildren={t("common.no")}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        {/* Schedule & venue section */}
        <FormSection
          icon={<CalendarOutlined />}
          title={t("events.scheduleSection")}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label={t("events.startAtLabel")} name="start_at">
                <DatePicker
                  showTime
                  size="large"
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("events.endAtLabel")} name="end_at">
                <DatePicker
                  showTime
                  size="large"
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("events.venueLabel")} name="venue">
                <Input size="large" placeholder={t("events.venuePlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("events.venueArLabel")} name="venue_ar">
                <Input size="large" dir="rtl" placeholder={t("events.venueArPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.isVirtualLabel")}
                name="is_virtual"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren={t("common.yes")}
                  unCheckedChildren={t("common.no")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.onlineLinkLabel")}
                name="online_link"
                rules={[{ type: "url", message: t("validation.url") }]}
              >
                <Input size="large" placeholder={t("events.onlineLinkPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.latLabel")}
                name={["location", "lat"]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="e.g. 30.0444"
                  step={0.0001}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("events.lngLabel")}
                name={["location", "lng"]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="e.g. 31.2357"
                  step={0.0001}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      </Form>
    </FormPageLayout>
  );
}
