import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  Typography,
  message,
} from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  BookOutlined,
  EnvironmentOutlined,
  StarOutlined,
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  createEntity,
  fetchEntities,
  fetchEntity,
  updateEntity,
  clearCurrentEntity,
} from "@/store/entitiesSlice";
import Base64ImageUpload from "@/components/Base64ImageUpload";
import FormPageLayout from "@/components/FormPageLayout";
import FormSection from "@/components/FormSection";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { getDirtyValues } from "@/lib/formUtils";
import { ImageIcon } from "lucide-react";

const { TextArea } = Input;
const { Text } = Typography;

function normalizeText(value) {
  if (value == null) return value;
  return String(value).trim();
}

function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
}

function normalizeOptionalValue(value) {
  return value ? value : null;
}

function ImagePreview({ src, label }) {
  return (
    <div style={{ marginTop: 12 }}>
      {src ? (
        <Image
          src={resolveMediaUrl(src)}
          alt={label}
          style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
          fallback=""
        />
      ) : (
        <div style={{
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdf9f4",
          borderRadius: 8,
          border: "1px dashed #d4c4a0",
          gap: 8,
        }}>
          <ImageIcon size={20} color="#bbb" />
          <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
        </div>
      )}
    </div>
  );
}

export default function EntityForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isEditing = Boolean(id);
  const parentIdFromQuery = searchParams.get("parentId");
  const { currentEntity, entities, loading, creating, updating, error } =
    useSelector((state) => state.entities);

  const watchedCoverImage = Form.useWatch("cover_image", form);
  const watchedThumbnail = Form.useWatch("thumbnail", form);
  const watchedOverviewImage = Form.useWatch("overview_image", form);
  const watchedHistoryImage = Form.useWatch("entity_history_image", form);
  const watchedDescriptionImage = Form.useWatch("entity_description_image", form);
  const watchedLandmarksImage = Form.useWatch("entity_landmarks_image", form);
  const watchedHasDetails = Form.useWatch("hasDetails", form);

  useEffect(() => {
    dispatch(fetchEntities({ page: 1, limit: 100 }));

    if (isEditing && id) {
      dispatch(fetchEntity(id));
    } else {
      dispatch(clearCurrentEntity());
    }

    return () => { dispatch(clearCurrentEntity()); };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (!isEditing || !currentEntity) return;

    form.setFieldsValue({
      name: currentEntity.name || "",
      name_ar: currentEntity.name_ar || "",
      excerpt: currentEntity.excerpt || "",
      excerpt_ar: currentEntity.excerpt_ar || "",
      cover_image: currentEntity.cover_image || "",
      overview_description: currentEntity.overview_description || "",
      overview_description_ar: currentEntity.overview_description_ar || "",
      overview_image: currentEntity.overview_image || "",
      entity_history: currentEntity.entity_history || "",
      entity_history_ar: currentEntity.entity_history_ar || "",
      entity_history_image: currentEntity.entity_history_image || "",
      entity_description: currentEntity.entity_description || "",
      entity_description_ar: currentEntity.entity_description_ar || "",
      entity_description_image: currentEntity.entity_description_image || "",
      entity_location_description: currentEntity.entity_location_description || "",
      entity_location_description_ar: currentEntity.entity_location_description_ar || "",
      entity_landmarks_description: currentEntity.entity_landmarks_description || "",
      entity_landmarks_description_ar: currentEntity.entity_landmarks_description_ar || "",
      entity_landmarks_image: currentEntity.entity_landmarks_image || "",
      thumbnail: currentEntity.thumbnail || "",
      vr_url: currentEntity.vr_url || "",
      hasDetails: currentEntity.hasDetails ?? false,
      parentId: currentEntity.parentId ?? undefined,
      gallery: currentEntity.gallery
        ? {
            title: currentEntity.gallery.title || "",
            title_ar: currentEntity.gallery.title_ar || "",
            items: (currentEntity.gallery.items || []).map((item) => ({
              id: item.id,
              image: item.path || item.image || "",
              caption: item.caption || "",
              caption_ar: item.caption_ar || "",
            })),
          }
        : { title: "", title_ar: "", items: [] },
    });
  }, [currentEntity, form, isEditing]);

  useEffect(() => {
    if (isEditing || !parentIdFromQuery) return;

    form.setFieldsValue({
      parentId: Number.isNaN(Number(parentIdFromQuery))
        ? parentIdFromQuery
        : Number(parentIdFromQuery),
    });
  }, [form, isEditing, parentIdFromQuery]);

  useEffect(() => {
    if (!error) return;
    message.error(
      isEditing ? t("entities.updateError") : t("entities.createError"),
    );
  }, [error, isEditing, t]);

  const handleSubmit = async (values) => {
    try {
      const hasDetails = Boolean(values.hasDetails);
      const payload = {
        name: normalizeText(values.name),
        name_ar: normalizeText(values.name_ar),
        excerpt: normalizeText(values.excerpt),
        excerpt_ar: normalizeText(values.excerpt_ar),
        cover_image: hasDetails ? normalizeOptionalValue(values.cover_image) : null,
        overview_description: hasDetails ? normalizeOptionalText(values.overview_description) : null,
        overview_description_ar: hasDetails ? normalizeOptionalText(values.overview_description_ar) : null,
        overview_image: hasDetails ? normalizeOptionalValue(values.overview_image) : null,
        entity_history: hasDetails ? normalizeOptionalText(values.entity_history) : null,
        entity_history_ar: hasDetails ? normalizeOptionalText(values.entity_history_ar) : null,
        entity_history_image: hasDetails ? normalizeOptionalValue(values.entity_history_image) : null,
        entity_description: hasDetails ? normalizeOptionalText(values.entity_description) : null,
        entity_description_ar: hasDetails ? normalizeOptionalText(values.entity_description_ar) : null,
        entity_description_image: hasDetails ? normalizeOptionalValue(values.entity_description_image) : null,
        entity_location_description: hasDetails ? normalizeOptionalText(values.entity_location_description) : null,
        entity_location_description_ar: hasDetails ? normalizeOptionalText(values.entity_location_description_ar) : null,
        entity_landmarks_description: hasDetails ? normalizeOptionalText(values.entity_landmarks_description) : null,
        entity_landmarks_description_ar: hasDetails ? normalizeOptionalText(values.entity_landmarks_description_ar) : null,
        entity_landmarks_image: hasDetails ? normalizeOptionalValue(values.entity_landmarks_image) : null,
        gallery: hasDetails
          ? {
              title: normalizeOptionalText(values.gallery?.title),
              title_ar: normalizeOptionalText(values.gallery?.title_ar),
              items: (values.gallery?.items || []).map((item) => ({
                ...(item.id ? { id: item.id } : {}),
                image: normalizeOptionalValue(item.image),
                caption: normalizeOptionalText(item.caption),
                caption_ar: normalizeOptionalText(item.caption_ar),
              })),
            }
          : null,
        vr_url: hasDetails ? normalizeOptionalText(values.vr_url) : null,
        thumbnail: normalizeOptionalValue(values.thumbnail),
        hasDetails,
        sections: [],
        parentId: values.parentId || null,
      };

      if (isEditing) {
        const hasDetailsInitial = currentEntity.hasDetails ?? false;
        const initial = {
          name: normalizeText(currentEntity.name),
          name_ar: normalizeText(currentEntity.name_ar),
          excerpt: normalizeText(currentEntity.excerpt),
          excerpt_ar: normalizeText(currentEntity.excerpt_ar),
          cover_image: hasDetailsInitial ? normalizeOptionalValue(currentEntity.cover_image) : null,
          overview_description: hasDetailsInitial ? normalizeOptionalText(currentEntity.overview_description) : null,
          overview_description_ar: hasDetailsInitial ? normalizeOptionalText(currentEntity.overview_description_ar) : null,
          overview_image: hasDetailsInitial ? normalizeOptionalValue(currentEntity.overview_image) : null,
          entity_history: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_history) : null,
          entity_history_ar: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_history_ar) : null,
          entity_history_image: hasDetailsInitial ? normalizeOptionalValue(currentEntity.entity_history_image) : null,
          entity_description: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_description) : null,
          entity_description_ar: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_description_ar) : null,
          entity_description_image: hasDetailsInitial ? normalizeOptionalValue(currentEntity.entity_description_image) : null,
          entity_location_description: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_location_description) : null,
          entity_location_description_ar: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_location_description_ar) : null,
          entity_landmarks_description: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_landmarks_description) : null,
          entity_landmarks_description_ar: hasDetailsInitial ? normalizeOptionalText(currentEntity.entity_landmarks_description_ar) : null,
          entity_landmarks_image: hasDetailsInitial ? normalizeOptionalValue(currentEntity.entity_landmarks_image) : null,
          gallery: hasDetailsInitial
            ? currentEntity.gallery
              ? {
                  title: normalizeOptionalText(currentEntity.gallery.title),
                  title_ar: normalizeOptionalText(currentEntity.gallery.title_ar),
                  items: (currentEntity.gallery.items || []).map((item) => ({
                    id: item.id,
                    image: normalizeOptionalValue(item.path || item.image),
                    caption: normalizeOptionalText(item.caption),
                    caption_ar: normalizeOptionalText(item.caption_ar),
                  })),
                }
              : { title: null, title_ar: null, items: [] }
            : null,
          vr_url: hasDetailsInitial ? normalizeOptionalText(currentEntity.vr_url) : null,
          thumbnail: normalizeOptionalValue(currentEntity.thumbnail),
          hasDetails: hasDetailsInitial,
          sections: [],
          parentId: currentEntity.parentId || null,
        };
        const dirtyPayload = getDirtyValues(payload, initial);
        if (Object.keys(dirtyPayload).length === 0) {
          message.success(t("entities.updateSuccess"));
          navigate(`/entities/${currentEntity?.id || id}`);
          return;
        }
        await dispatch(updateEntity({ id: currentEntity?.id || id, data: dirtyPayload })).unwrap();
        message.success(t("entities.updateSuccess"));
        navigate(`/entities/${currentEntity?.id || id}`);
        return;
      }

      const createdEntity = await dispatch(createEntity(payload)).unwrap();
      message.success(t("entities.createSuccess"));
      navigate(`/entities/${createdEntity?.id}`);
    } catch (submitError) {
      if (submitError?.errorFields) return;
      message.error(
        isEditing ? t("entities.updateError") : t("entities.createError"),
      );
    }
  };

  const entityOptions = (entities || [])
    .filter((entity) => String(entity.id) !== String(id))
    .map((entity) => ({
      label: entity.name_ar ? `${entity.name} / ${entity.name_ar}` : entity.name,
      value: entity.id,
    }));

  const isPageLoading = isEditing && loading && !currentEntity;

  if (isPageLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <FormPageLayout
      title={isEditing ? t("entities.edit") : t("entities.create")}
      subtitle={t("navigation.entities")}
      backPath={isEditing ? `/entities/${id}` : "/entities"}
      form={form}
      saving={creating || updating}
      isEditMode={isEditing}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ hasDetails: false }}
        scrollToFirstError
      >
        <FormSection icon={<HomeOutlined />} title={t("entities.basicInfo")}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label={t("entities.name")}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input placeholder={t("entities.namePlaceholder")} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="name_ar"
                label={t("entities.nameAr")}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input dir="rtl" placeholder={t("entities.nameArPlaceholder")} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="excerpt"
                label={t("entities.excerpt")}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <TextArea rows={4} placeholder={t("entities.excerptPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="excerpt_ar"
                label={t("entities.excerptAr")}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <TextArea rows={4} dir="rtl" placeholder={t("entities.excerptArPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="parentId" label={t("entities.parent")}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder={t("entities.selectParent")}
                  size="large"
                  options={entityOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="thumbnail"
                label={t("entities.thumbnail")}
                rules={[{
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error(t("validation.required"))),
                }]}
              >
                <Base64ImageUpload
                  buttonLabel={t("entities.uploadThumbnail")}
                  emptyLabel={t("entities.noImage")}
                  removeLabel={t("entities.removeImage")}
                  errorLabel={t("entities.imageProcessError")}
                />
              </Form.Item>
              <ImagePreview src={watchedThumbnail} label={t("entities.thumbnail")} />
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<BookOutlined />} title={t("entities.hasDetails")}>
          <Form.Item name="hasDetails" label={t("entities.hasDetails")} valuePropName="checked">
            <Switch checkedChildren={t("common.yes")} unCheckedChildren={t("common.no")} />
          </Form.Item>
        </FormSection>

        {watchedHasDetails && (
          <>
            <FormSection icon={<BookOutlined />} title={t("entities.images")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="cover_image" label={t("entities.coverImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadCoverImage")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                  <ImagePreview src={watchedCoverImage} label={t("entities.coverImage")} />
                </Col>
              </Row>
            </FormSection>

            <FormSection icon={<FileTextOutlined />} title={t("entities.overviewSection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="overview_description"
                    label={t("entities.overviewDescription")}
                  >
                    <TextArea rows={5} placeholder={t("entities.overviewDescriptionPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="overview_description_ar"
                    label={t("entities.overviewDescriptionAr")}
                  >
                    <TextArea rows={5} dir="rtl" placeholder={t("entities.overviewDescriptionArPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="overview_image" label={t("entities.overviewImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadOverviewImage")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                  <ImagePreview src={watchedOverviewImage} label={t("entities.overviewImage")} />
                </Col>
              </Row>
            </FormSection>

            <FormSection icon={<StarOutlined />} title={t("entities.historySection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_history" label={t("entities.entityHistory")}>
                    <TextArea rows={5} placeholder={t("entities.entityHistoryPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_history_ar" label={t("entities.entityHistoryAr")}>
                    <TextArea rows={5} dir="rtl" placeholder={t("entities.entityHistoryArPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_history_image" label={t("entities.entityHistoryImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadHistoryImage")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                  <ImagePreview src={watchedHistoryImage} label={t("entities.entityHistoryImage")} />
                </Col>
              </Row>
            </FormSection>

            <FormSection icon={<FileTextOutlined />} title={t("entities.descriptionSection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_description" label={t("entities.entityDescription")}>
                    <TextArea rows={5} placeholder={t("entities.entityDescriptionPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_description_ar" label={t("entities.entityDescriptionAr")}>
                    <TextArea rows={5} dir="rtl" placeholder={t("entities.entityDescriptionArPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_description_image" label={t("entities.entityDescriptionImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadDescriptionImage")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                  <ImagePreview src={watchedDescriptionImage} label={t("entities.entityDescriptionImage")} />
                </Col>
              </Row>
            </FormSection>

            <FormSection icon={<EnvironmentOutlined />} title={t("entities.locationSection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="entity_location_description"
                    label={t("entities.entityLocationDescription")}
                  >
                    <TextArea rows={5} placeholder={t("entities.entityLocationDescriptionPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="entity_location_description_ar"
                    label={t("entities.entityLocationDescriptionAr")}
                  >
                    <TextArea rows={5} dir="rtl" placeholder={t("entities.entityLocationDescriptionArPlaceholder")} />
                  </Form.Item>
                </Col>
              </Row>
            </FormSection>

            <FormSection icon={<StarOutlined />} title={t("entities.landmarksSection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="entity_landmarks_description"
                    label={t("entities.entityLandmarksDescription")}
                  >
                    <TextArea rows={5} placeholder={t("entities.entityLandmarksDescriptionPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="entity_landmarks_description_ar"
                    label={t("entities.entityLandmarksDescriptionAr")}
                  >
                    <TextArea rows={5} dir="rtl" placeholder={t("entities.entityLandmarksDescriptionArPlaceholder")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="entity_landmarks_image" label={t("entities.entityLandmarksImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadLandmarksImage")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                  <ImagePreview src={watchedLandmarksImage} label={t("entities.entityLandmarksImage")} />
                </Col>
              </Row>
            </FormSection>

            <FormSection icon={<PictureOutlined />} title={t("entities.gallerySection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name={["gallery", "title"]} label={t("entities.galleryTitle")}>
                    <Input placeholder={t("entities.galleryTitlePlaceholder")} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={["gallery", "title_ar"]} label={t("entities.galleryTitleAr")}>
                    <Input dir="rtl" placeholder={t("entities.galleryTitleArPlaceholder")} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.List name={["gallery", "items"]}>
                {(fields, { add, remove }) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {fields.map(({ key, name }) => (
                      <div
                        key={key}
                        style={{
                          border: "1px solid rgba(107,26,26,0.12)",
                          borderRadius: 12,
                          padding: 16,
                          background: "#fdf9f4",
                          position: "relative",
                        }}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => remove(name)}
                          style={{ position: "absolute", top: 12, right: 12 }}
                        >
                          {t("entities.galleryRemoveImage")}
                        </Button>

                        <Row gutter={[24, 0]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name={[name, "image"]}
                              label={t("entities.galleryUploadImage")}
                            >
                              <Base64ImageUpload
                                buttonLabel={t("entities.galleryUploadImage")}
                                emptyLabel={t("entities.noImage")}
                                removeLabel={t("entities.removeImage")}
                                errorLabel={t("entities.imageProcessError")}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[24, 0]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name={[name, "caption"]}
                              label={t("entities.galleryItemCaption")}
                            >
                              <Input placeholder={t("entities.galleryItemCaptionPlaceholder")} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name={[name, "caption_ar"]}
                              label={t("entities.galleryItemCaptionAr")}
                            >
                              <Input dir="rtl" placeholder={t("entities.galleryItemCaptionArPlaceholder")} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => add({ image: "", caption: "", caption_ar: "" })}
                      icon={<PlusOutlined />}
                      style={{ width: "100%" }}
                    >
                      {t("entities.galleryAddImage")}
                    </Button>
                  </div>
                )}
              </Form.List>
            </FormSection>

            <FormSection icon={<LinkOutlined />} title={t("entities.vrSection")}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="vr_url"
                    label={t("entities.vrUrl")}
                    rules={[{ type: "url", message: t("validation.url") }]}
                  >
                    <Input placeholder={t("entities.vrUrlPlaceholder")} size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </FormSection>
          </>
        )}
      </Form>
    </FormPageLayout>
  );
}
