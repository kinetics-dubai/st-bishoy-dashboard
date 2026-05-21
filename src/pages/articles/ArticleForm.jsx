import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Form, Input, Row, Col, Switch, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import {
  fetchArticle,
  createArticle,
  updateArticle,
  clearCurrentArticle,
} from "@/store/articlesSlice";
import { getDirtyValues } from "@/lib/formUtils";
import FormPageLayout from "@/components/FormPageLayout";
import FormSection from "@/components/FormSection";
import RichTextEditor from "@/components/RichTextEditor";
import Base64ImageUpload from "@/components/Base64ImageUpload";

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { currentArticle, creating, updating } = useSelector(
    (state) => state.articles,
  );

  const isEditMode = !!id && !window.location.pathname.includes("/create");

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchArticle(id));
    } else {
      dispatch(clearCurrentArticle());
    }
    return () => {
      dispatch(clearCurrentArticle());
    };
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentArticle && isEditMode) {
      form.setFieldsValue({
        title: currentArticle.title || "",
        title_ar: currentArticle.title_ar || "",
        content: currentArticle.content || "",
        content_ar: currentArticle.content_ar || "",
        cover_image: currentArticle.cover_image || "",
        thumbnail: currentArticle.thumbnail || "",
        published: Boolean(currentArticle.published),
      });
    }
  }, [currentArticle, form, isEditMode]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title?.trim(),
        title_ar: values.title_ar?.trim(),
        content: values.content || "",
        content_ar: values.content_ar || "",
        cover_image: values.cover_image || "",
        thumbnail: values.thumbnail || "",
        published: Boolean(values.published),
      };

      if (isEditMode) {
        const initial = {
          title: currentArticle.title?.trim() || "",
          title_ar: currentArticle.title_ar?.trim() || "",
          content: currentArticle.content || "",
          content_ar: currentArticle.content_ar || "",
          cover_image: currentArticle.cover_image || "",
          thumbnail: currentArticle.thumbnail || "",
          published: Boolean(currentArticle.published),
        };
        const payload = getDirtyValues(data, initial);
        if (Object.keys(payload).length === 0) {
          message.info(t("common.noChanges", "No changes to save"));
          navigate("/articles");
          return;
        }
        await dispatch(updateArticle({ id, data: payload })).unwrap();
        message.success(t("articles.updateSuccess"));
        navigate("/articles");
      } else {
        const response = await dispatch(createArticle(data)).unwrap();
        message.success(t("articles.createSuccess"));
        navigate(`/articles/${response.id}`);
      }
    } catch (error) {
      message.error(error?.message || error?.detail || t("common.error"));
    }
  };

  return (
    <FormPageLayout
      title={isEditMode ? t("articles.edit") : t("articles.create")}
      subtitle={t("navigation.articles")}
      backPath="/articles"
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ published: false }}
      >
        <FormSection
          icon={<FileTextOutlined />}
          title={t("navigation.articles")}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("articles.titleLabel")}
                name="title"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input
                  size="large"
                  placeholder={t("articles.titlePlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("articles.titleArLabel")}
                name="title_ar"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input
                  size="large"
                  dir="rtl"
                  placeholder={t("articles.titleArPlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={t("articles.contentLabel")}
                name="content"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <RichTextEditor
                  placeholder={t("articles.contentPlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={t("articles.contentArLabel")}
                name="content_ar"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                {/* <div dir="rtl"> */}
                <RichTextEditor
                  rtl={true}
                  placeholder={t("articles.contentArPlaceholder")}
                />
                {/* </div> */}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("articles.coverImageLabel")}
                name="cover_image"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Base64ImageUpload
                  buttonLabel={t("articles.uploadCoverImage")}
                  emptyLabel={t("articles.noImage")}
                  removeLabel={t("articles.removeImage")}
                  errorLabel={t("articles.imageProcessError")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("articles.thumbnailLabel")}
                name="thumbnail"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Base64ImageUpload
                  buttonLabel={t("articles.uploadThumbnail")}
                  emptyLabel={t("articles.noImage")}
                  removeLabel={t("articles.removeImage")}
                  errorLabel={t("articles.imageProcessError")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("articles.publishedLabel")}
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
      </Form>
    </FormPageLayout>
  );
}
