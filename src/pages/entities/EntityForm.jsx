import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  SaveOutlined,
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
import { resolveMediaUrl } from "@/lib/mediaUrl";

const { Title, Text } = Typography;
const { TextArea } = Input;

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

function ImagePreview({ src, label, emptyLabel }) {
  return (
    <Card size="small" title={label}>
      {src ? (
        <Image
          src={resolveMediaUrl(src)}
          alt={label}
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 12,
          }}
          fallback=""
        />
      ) : (
        <div style={{ minHeight: 160, display: "grid", placeItems: "center" }}>
          <Text type="secondary">{emptyLabel}</Text>
        </div>
      )}
    </Card>
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
  const watchedDescriptionImage = Form.useWatch(
    "entity_description_image",
    form,
  );
  const watchedLandmarksImage = Form.useWatch("entity_landmarks_image", form);
  const watchedHasDetails = Form.useWatch("hasDetails", form);

  useEffect(() => {
    dispatch(fetchEntities({ page: 1, limit: 1000 }));

    if (isEditing && id) {
      dispatch(fetchEntity(id));
    } else {
      dispatch(clearCurrentEntity());
    }

    return () => {
      dispatch(clearCurrentEntity());
    };
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
      entity_location_description:
        currentEntity.entity_location_description || "",
      entity_location_description_ar:
        currentEntity.entity_location_description_ar || "",
      entity_landmarks_description:
        currentEntity.entity_landmarks_description || "",
      entity_landmarks_description_ar:
        currentEntity.entity_landmarks_description_ar || "",
      entity_landmarks_image: currentEntity.entity_landmarks_image || "",
      thumbnail: currentEntity.thumbnail || "",
      hasDetails: currentEntity.hasDetails ?? false,
      parentId: currentEntity.parentId ?? undefined,
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
        cover_image: normalizeOptionalValue(values.cover_image),
        overview_description: normalizeOptionalText(
          values.overview_description,
        ),
        overview_description_ar: normalizeOptionalText(
          values.overview_description_ar,
        ),
        overview_image: normalizeOptionalValue(values.overview_image),
        entity_history: hasDetails
          ? normalizeOptionalText(values.entity_history)
          : null,
        entity_history_ar: hasDetails
          ? normalizeOptionalText(values.entity_history_ar)
          : null,
        entity_history_image: hasDetails
          ? normalizeOptionalValue(values.entity_history_image)
          : null,
        entity_description: hasDetails
          ? normalizeOptionalText(values.entity_description)
          : null,
        entity_description_ar: hasDetails
          ? normalizeOptionalText(values.entity_description_ar)
          : null,
        entity_description_image: hasDetails
          ? normalizeOptionalValue(values.entity_description_image)
          : null,
        entity_location_description: hasDetails
          ? normalizeOptionalText(values.entity_location_description)
          : null,
        entity_location_description_ar: hasDetails
          ? normalizeOptionalText(values.entity_location_description_ar)
          : null,
        entity_landmarks_description: hasDetails
          ? normalizeOptionalText(values.entity_landmarks_description)
          : null,
        entity_landmarks_description_ar: hasDetails
          ? normalizeOptionalText(values.entity_landmarks_description_ar)
          : null,
        entity_landmarks_image: hasDetails
          ? normalizeOptionalValue(values.entity_landmarks_image)
          : null,
        thumbnail: normalizeOptionalValue(values.thumbnail),
        hasDetails,
        sections: [],
        parentId: values.parentId || null,
      };

      if (isEditing) {
        await dispatch(
          updateEntity({ id: currentEntity?.id || id, data: payload }),
        ).unwrap();
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
      label: entity.name_ar
        ? `${entity.name} / ${entity.name_ar}`
        : entity.name,
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
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate(isEditing ? `/entities/${id}` : "/entities")
            }
          >
            {t("common.back")}
          </Button>
          <Title
            level={2}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <HomeOutlined style={{ color: "#5C1A1B" }} />
            {isEditing ? t("entities.edit") : t("entities.create")}
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ hasDetails: false }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={16}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label={t("entities.name")}
                    rules={[
                      { required: true, message: t("validation.required") },
                    ]}
                  >
                    <Input
                      placeholder={t("entities.namePlaceholder")}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="name_ar"
                    label={t("entities.nameAr")}
                    rules={[
                      { required: true, message: t("validation.required") },
                    ]}
                  >
                    <Input
                      dir="rtl"
                      placeholder={t("entities.nameArPlaceholder")}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="excerpt"
                    label={t("entities.excerpt")}
                    rules={[
                      { required: true, message: t("validation.required") },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder={t("entities.excerptPlaceholder")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="excerpt_ar"
                    label={t("entities.excerptAr")}
                    rules={[
                      { required: true, message: t("validation.required") },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      dir="rtl"
                      placeholder={t("entities.excerptArPlaceholder")}
                    />
                  </Form.Item>
                </Col>
              </Row>

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
              <Form.Item
                name="thumbnail"
                label={t("entities.thumbnail")}
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error(t("validation.required"))),
                  },
                ]}
              >
                <Base64ImageUpload
                  buttonLabel={t("entities.uploadThumbnail")}
                  emptyLabel={t("entities.noImage")}
                  removeLabel={t("entities.removeImage")}
                  errorLabel={t("entities.imageProcessError")}
                />
              </Form.Item>
              <Form.Item
                name="hasDetails"
                label={t("entities.hasDetails")}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren={t("common.yes")}
                  unCheckedChildren={t("common.no")}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="thumbnail"
                    label={t("entities.thumbnail")}
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(t("validation.required")),
                              ),
                      },
                    ]}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadThumbnail")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="cover_image"
                    label={t("entities.coverImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("entities.uploadCoverImage")}
                      emptyLabel={t("entities.noImage")}
                      removeLabel={t("entities.removeImage")}
                      errorLabel={t("entities.imageProcessError")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Card
                size="small"
                title={t("entities.overviewSection")}
                style={{ marginBottom: 24 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="overview_description"
                      label={t("entities.overviewDescription")}
                    >
                      <TextArea
                        rows={5}
                        placeholder={t(
                          "entities.overviewDescriptionPlaceholder",
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="overview_description_ar"
                      label={t("entities.overviewDescriptionAr")}
                    >
                      <TextArea
                        rows={5}
                        dir="rtl"
                        placeholder={t(
                          "entities.overviewDescriptionArPlaceholder",
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="overview_image"
                  label={t("entities.overviewImage")}
                >
                  <Base64ImageUpload
                    buttonLabel={t("entities.uploadOverviewImage")}
                    emptyLabel={t("entities.noImage")}
                    removeLabel={t("entities.removeImage")}
                    errorLabel={t("entities.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              {watchedHasDetails ? (
                <>
                  <Card
                    size="small"
                    title={t("entities.historySection")}
                    style={{ marginBottom: 24 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_history"
                          label={t("entities.entityHistory")}
                        >
                          <TextArea
                            rows={5}
                            placeholder={t("entities.entityHistoryPlaceholder")}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_history_ar"
                          label={t("entities.entityHistoryAr")}
                        >
                          <TextArea
                            rows={5}
                            dir="rtl"
                            placeholder={t(
                              "entities.entityHistoryArPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="entity_history_image"
                      label={t("entities.entityHistoryImage")}
                    >
                      <Base64ImageUpload
                        buttonLabel={t("entities.uploadHistoryImage")}
                        emptyLabel={t("entities.noImage")}
                        removeLabel={t("entities.removeImage")}
                        errorLabel={t("entities.imageProcessError")}
                      />
                    </Form.Item>
                  </Card>

                  <Card
                    size="small"
                    title={t("entities.descriptionSection")}
                    style={{ marginBottom: 24 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_description"
                          label={t("entities.entityDescription")}
                        >
                          <TextArea
                            rows={5}
                            placeholder={t(
                              "entities.entityDescriptionPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_description_ar"
                          label={t("entities.entityDescriptionAr")}
                        >
                          <TextArea
                            rows={5}
                            dir="rtl"
                            placeholder={t(
                              "entities.entityDescriptionArPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="entity_description_image"
                      label={t("entities.entityDescriptionImage")}
                    >
                      <Base64ImageUpload
                        buttonLabel={t("entities.uploadDescriptionImage")}
                        emptyLabel={t("entities.noImage")}
                        removeLabel={t("entities.removeImage")}
                        errorLabel={t("entities.imageProcessError")}
                      />
                    </Form.Item>
                  </Card>

                  <Card
                    size="small"
                    title={t("entities.locationSection")}
                    style={{ marginBottom: 24 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_location_description"
                          label={t("entities.entityLocationDescription")}
                        >
                          <TextArea
                            rows={5}
                            placeholder={t(
                              "entities.entityLocationDescriptionPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_location_description_ar"
                          label={t("entities.entityLocationDescriptionAr")}
                        >
                          <TextArea
                            rows={5}
                            dir="rtl"
                            placeholder={t(
                              "entities.entityLocationDescriptionArPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  <Card
                    size="small"
                    title={t("entities.landmarksSection")}
                    style={{ marginBottom: 24 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_landmarks_description"
                          label={t("entities.entityLandmarksDescription")}
                        >
                          <TextArea
                            rows={5}
                            placeholder={t(
                              "entities.entityLandmarksDescriptionPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="entity_landmarks_description_ar"
                          label={t("entities.entityLandmarksDescriptionAr")}
                        >
                          <TextArea
                            rows={5}
                            dir="rtl"
                            placeholder={t(
                              "entities.entityLandmarksDescriptionArPlaceholder",
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="entity_landmarks_image"
                      label={t("entities.entityLandmarksImage")}
                    >
                      <Base64ImageUpload
                        buttonLabel={t("entities.uploadLandmarksImage")}
                        emptyLabel={t("entities.noImage")}
                        removeLabel={t("entities.removeImage")}
                        errorLabel={t("entities.imageProcessError")}
                      />
                    </Form.Item>
                  </Card>
                </>
              ) : null}
            </Col>

            <Col xs={24} lg={8}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <ImagePreview
                  src={watchedThumbnail}
                  label={t("entities.thumbnail")}
                  emptyLabel={t("entities.noImage")}
                />
                <ImagePreview
                  src={watchedCoverImage}
                  label={t("entities.coverImage")}
                  emptyLabel={t("entities.noImage")}
                />
                <ImagePreview
                  src={watchedOverviewImage}
                  label={t("entities.overviewImage")}
                  emptyLabel={t("entities.noImage")}
                />
                {watchedHasDetails ? (
                  <>
                    <ImagePreview
                      src={watchedHistoryImage}
                      label={t("entities.entityHistoryImage")}
                      emptyLabel={t("entities.noImage")}
                    />
                    <ImagePreview
                      src={watchedDescriptionImage}
                      label={t("entities.entityDescriptionImage")}
                      emptyLabel={t("entities.noImage")}
                    />
                    <ImagePreview
                      src={watchedLandmarksImage}
                      label={t("entities.entityLandmarksImage")}
                      emptyLabel={t("entities.noImage")}
                    />
                  </>
                ) : null}
              </Space>
            </Col>
          </Row>

          <div
            style={{
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={creating || updating}
                size="large"
              >
                {isEditing ? t("common.update") : t("common.create")}
              </Button>
              <Button
                onClick={() =>
                  navigate(isEditing ? `/entities/${id}` : "/entities")
                }
                size="large"
              >
                {t("common.cancel")}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
