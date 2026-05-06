import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import apiService from "@/services/apiService";
import Base64ImageUpload from "@/components/Base64ImageUpload";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const { Title, Text } = Typography;
const { TextArea } = Input;

const HISTORY_ITEM_SHAPE = {
  title: "",
  title_ar: "",
  content: "",
  content_ar: "",
};

const DEVELOPMENT_IMAGE_SHAPE = {
  image: "",
  caption: "",
  caption_ar: "",
};

const DEFAULT_MONASTERY = {
  id: "monastery_singleton",
  cover_image: "",
  about_description: "",
  about_description_ar: "",
  about_image: "",
  monastery_wall_description: "",
  monastery_wall_description_ar: "",
  monastery_wall_image: "",
  catacomb_image: "",
  catacomb_description: "",
  catacomb_description_ar: "",
  monastery_development_description: "",
  monastery_development_description_ar: "",
  papal_description: "",
  papal_description_ar: "",
  papal_image: "",
  myron_description: "",
  myron_description_ar: "",
  monastery_history: [],
  myron_timeline: [],
  monastery_development_images: [],
};

function normalizeText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeOptionalValue(value) {
  return value ? String(value) : "";
}

function normalizeList(items, shape) {
  if (!Array.isArray(items)) return [];

  return items.map((item) =>
    Object.fromEntries(
      Object.entries(shape).map(([key, defaultValue]) => [
        key,
        key === "image"
          ? normalizeOptionalValue(item?.[key] ?? defaultValue)
          : normalizeText(item?.[key] ?? defaultValue),
      ]),
    ),
  );
}

function normalizeMonastery(payload) {
  const rawMonastery = payload?.data ?? payload ?? {};
  const cover = rawMonastery.cover ?? {};
  const about = rawMonastery.about ?? {};
  const monasteryWall = rawMonastery.monastery_wall ?? {};
  const catacomb = rawMonastery.catacomb ?? {};
  const monasteryDevelopment = rawMonastery.monastery_development ?? {};
  const papal = rawMonastery.papal ?? {};
  const myron = rawMonastery.myron ?? {};
  const history = rawMonastery.history ?? {};

  return {
    ...DEFAULT_MONASTERY,
    id: rawMonastery.id ?? DEFAULT_MONASTERY.id,
    cover_image: normalizeOptionalValue(
      rawMonastery.cover_image ?? cover.image,
    ),
    about_description: normalizeText(
      rawMonastery.about_description ?? about.description,
    ),
    about_description_ar: normalizeText(
      rawMonastery.about_description_ar ?? about.description_ar,
    ),
    about_image: normalizeOptionalValue(
      rawMonastery.about_image ?? about.image,
    ),
    monastery_wall_description: normalizeText(
      rawMonastery.monastery_wall_description ?? monasteryWall.description,
    ),
    monastery_wall_description_ar: normalizeText(
      rawMonastery.monastery_wall_description_ar ?? monasteryWall.description_ar,
    ),
    monastery_wall_image: normalizeOptionalValue(
      rawMonastery.monastery_wall_image ?? monasteryWall.image,
    ),
    catacomb_image: normalizeOptionalValue(
      rawMonastery.catacomb_image ?? catacomb.image,
    ),
    catacomb_description: normalizeText(
      rawMonastery.catacomb_description ?? catacomb.description,
    ),
    catacomb_description_ar: normalizeText(
      rawMonastery.catacomb_description_ar ?? catacomb.description_ar,
    ),
    monastery_development_description: normalizeText(
      rawMonastery.monastery_development_description ??
        monasteryDevelopment.description,
    ),
    monastery_development_description_ar: normalizeText(
      rawMonastery.monastery_development_description_ar ??
        monasteryDevelopment.description_ar,
    ),
    papal_description: normalizeText(
      rawMonastery.papal_description ?? papal.description,
    ),
    papal_description_ar: normalizeText(
      rawMonastery.papal_description_ar ?? papal.description_ar,
    ),
    papal_image: normalizeOptionalValue(rawMonastery.papal_image ?? papal.image),
    myron_description: normalizeText(
      rawMonastery.myron_description ?? myron.description,
    ),
    myron_description_ar: normalizeText(
      rawMonastery.myron_description_ar ?? myron.description_ar,
    ),
    monastery_history: normalizeList(
      rawMonastery.monastery_history ?? history.content,
      HISTORY_ITEM_SHAPE,
    ),
    myron_timeline: normalizeList(
      rawMonastery.myron_timeline ?? myron.timeline,
      HISTORY_ITEM_SHAPE,
    ),
    monastery_development_images: normalizeList(
      rawMonastery.monastery_development_images,
      DEVELOPMENT_IMAGE_SHAPE,
    ),
  };
}

function buildMonasteryPayload(values) {
  return {
    cover_image: normalizeOptionalValue(values.cover_image),
    about_description: normalizeText(values.about_description),
    about_description_ar: normalizeText(values.about_description_ar),
    about_image: normalizeOptionalValue(values.about_image),
    monastery_wall_description: normalizeText(values.monastery_wall_description),
    monastery_wall_description_ar: normalizeText(
      values.monastery_wall_description_ar,
    ),
    monastery_wall_image: normalizeOptionalValue(values.monastery_wall_image),
    catacomb_image: normalizeOptionalValue(values.catacomb_image),
    catacomb_description: normalizeText(values.catacomb_description),
    catacomb_description_ar: normalizeText(values.catacomb_description_ar),
    monastery_development_description: normalizeText(
      values.monastery_development_description,
    ),
    monastery_development_description_ar: normalizeText(
      values.monastery_development_description_ar,
    ),
    papal_description: normalizeText(values.papal_description),
    papal_description_ar: normalizeText(values.papal_description_ar),
    papal_image: normalizeOptionalValue(values.papal_image),
    myron_description: normalizeText(values.myron_description),
    myron_description_ar: normalizeText(values.myron_description_ar),
    monastery_history: normalizeList(values.monastery_history, HISTORY_ITEM_SHAPE),
    myron_timeline: normalizeList(values.myron_timeline, HISTORY_ITEM_SHAPE),
    monastery_development_images: normalizeList(
      values.monastery_development_images,
      DEVELOPMENT_IMAGE_SHAPE,
    ),
  };
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

function BilingualTextFields({
  leftName,
  leftLabel,
  leftPlaceholder,
  rightName,
  rightLabel,
  rightPlaceholder,
  rows = 4,
  textarea = false,
}) {
  const Component = textarea ? TextArea : Input;

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name={leftName} label={leftLabel}>
          <Component rows={textarea ? rows : undefined} placeholder={leftPlaceholder} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name={rightName} label={rightLabel}>
          <Component
            rows={textarea ? rows : undefined}
            dir="rtl"
            placeholder={rightPlaceholder}
          />
        </Form.Item>
      </Col>
    </Row>
  );
}

function RepeaterHeader({ title, addLabel, onAdd }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      <Text strong>{title}</Text>
      <Button icon={<PlusOutlined />} onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  );
}

function HistoryList({ t, name, titleKey, addLabelKey }) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          <RepeaterHeader
            title={t(titleKey)}
            addLabel={t(addLabelKey)}
            onAdd={() => add({ ...HISTORY_ITEM_SHAPE })}
          />

          {!fields.length ? (
            <Text type="secondary">{t("monastery.emptyRows")}</Text>
          ) : null}

          {fields.map((field, index) => (
            <Card
              key={field.key}
              size="small"
              style={{ marginBottom: 16 }}
              title={`${t("monastery.entry")} ${index + 1}`}
              extra={
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                >
                  {t("monastery.removeRow")}
                </Button>
              }
            >
              <BilingualTextFields
                leftName={[field.name, "title"]}
                leftLabel={t("monastery.rowTitle")}
                leftPlaceholder={t("monastery.rowTitlePlaceholder")}
                rightName={[field.name, "title_ar"]}
                rightLabel={t("monastery.rowTitleAr")}
                rightPlaceholder={t("monastery.rowTitleArPlaceholder")}
              />
              <BilingualTextFields
                leftName={[field.name, "content"]}
                leftLabel={t("monastery.rowContent")}
                leftPlaceholder={t("monastery.rowContentPlaceholder")}
                rightName={[field.name, "content_ar"]}
                rightLabel={t("monastery.rowContentAr")}
                rightPlaceholder={t("monastery.rowContentArPlaceholder")}
                textarea
                rows={5}
              />
            </Card>
          ))}
        </>
      )}
    </Form.List>
  );
}

function DevelopmentImagesList({ t }) {
  return (
    <Form.List name="monastery_development_images">
      {(fields, { add, remove }) => (
        <>
          <RepeaterHeader
            title={t("monastery.developmentGallery")}
            addLabel={t("monastery.addDevelopmentImage")}
            onAdd={() => add({ ...DEVELOPMENT_IMAGE_SHAPE })}
          />

          {!fields.length ? (
            <Text type="secondary">{t("monastery.emptyRows")}</Text>
          ) : null}

          {fields.map((field, index) => (
            <Card
              key={field.key}
              size="small"
              style={{ marginBottom: 16 }}
              title={`${t("monastery.imageEntry")} ${index + 1}`}
              extra={
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                >
                  {t("monastery.removeRow")}
                </Button>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                  <Form.Item
                    name={[field.name, "image"]}
                    label={t("monastery.developmentImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("monastery.uploadDevelopmentImage")}
                      emptyLabel={t("monastery.noImage")}
                      removeLabel={t("monastery.removeImage")}
                      errorLabel={t("monastery.imageProcessError")}
                    />
                  </Form.Item>
                  <BilingualTextFields
                    leftName={[field.name, "caption"]}
                    leftLabel={t("monastery.caption")}
                    leftPlaceholder={t("monastery.captionPlaceholder")}
                    rightName={[field.name, "caption_ar"]}
                    rightLabel={t("monastery.captionAr")}
                    rightPlaceholder={t("monastery.captionArPlaceholder")}
                  />
                </Col>
                <Col xs={24} lg={10}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, nextValues) =>
                      prevValues?.monastery_development_images?.[field.name]?.image !==
                      nextValues?.monastery_development_images?.[field.name]?.image
                    }
                  >
                    {({ getFieldValue }) => (
                      <ImagePreview
                        src={getFieldValue([
                          "monastery_development_images",
                          field.name,
                          "image",
                        ])}
                        label={t("monastery.developmentImagePreview")}
                        emptyLabel={t("monastery.noImage")}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
        </>
      )}
    </Form.List>
  );
}

export default function MonasteryPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [monasteryId, setMonasteryId] = useState(DEFAULT_MONASTERY.id);
  const [initialMonastery, setInitialMonastery] = useState(DEFAULT_MONASTERY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const watchedCoverImage = Form.useWatch("cover_image", form);
  const watchedAboutImage = Form.useWatch("about_image", form);
  const watchedWallImage = Form.useWatch("monastery_wall_image", form);
  const watchedCatacombImage = Form.useWatch("catacomb_image", form);
  const watchedPapalImage = Form.useWatch("papal_image", form);

  useEffect(() => {
    const fetchMonastery = async () => {
      try {
        setLoading(true);
        const response = await apiService.get("/monastery");
        const normalizedMonastery = normalizeMonastery(response.data);
        setMonasteryId(normalizedMonastery.id || DEFAULT_MONASTERY.id);
        setInitialMonastery(normalizedMonastery);
        form.setFieldsValue(normalizedMonastery);
      } catch (error) {
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            t("monastery.fetchError"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMonastery();
  }, [form, t]);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const nextValues = buildMonasteryPayload(values);
      const payload = {};

      for (const [key, value] of Object.entries(nextValues)) {
        const previousValue = initialMonastery[key];
        const isArrayField = Array.isArray(value);
        const hasChanged = isArrayField
          ? JSON.stringify(value) !== JSON.stringify(previousValue)
          : value !== previousValue;

        if (hasChanged) {
          payload[key] = value;
        }
      }

      if (!Object.keys(payload).length) {
        message.info(t("common.noChanges"));
        setSaving(false);
        return;
      }

      const response = await apiService.put("/monastery", payload);
      const nextBaselineSource = response?.data?.data
        ? response.data
        : { ...initialMonastery, ...nextValues, ...payload, id: monasteryId };
      const normalizedMonastery = normalizeMonastery(nextBaselineSource);

      setMonasteryId(normalizedMonastery.id || monasteryId);
      setInitialMonastery(normalizedMonastery);
      form.setFieldsValue(normalizedMonastery);
      message.success(t("monastery.saveSuccess"));
    } catch (error) {
      message.error(
        error?.response?.data?.message || error?.message || t("monastery.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <Title
            level={2}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AppstoreOutlined style={{ color: "#5C1A1B" }} />
            {t("monastery.title")}
          </Title>
          <Text type="secondary">
            {t("monastery.singletonId")}: {monasteryId}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={DEFAULT_MONASTERY}
          onFinish={handleSubmit}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={16}>
              <Card
                size="small"
                title={t("monastery.coverSection")}
                style={{ marginBottom: 24 }}
              >
                <Form.Item name="cover_image" label={t("monastery.coverImage")}>
                  <Base64ImageUpload
                    buttonLabel={t("monastery.uploadCoverImage")}
                    emptyLabel={t("monastery.noImage")}
                    removeLabel={t("monastery.removeImage")}
                    errorLabel={t("monastery.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              <Card
                size="small"
                title={t("monastery.aboutSection")}
                style={{ marginBottom: 24 }}
              >
                <BilingualTextFields
                  leftName="about_description"
                  leftLabel={t("monastery.aboutDescription")}
                  leftPlaceholder={t("monastery.aboutDescriptionPlaceholder")}
                  rightName="about_description_ar"
                  rightLabel={t("monastery.aboutDescriptionAr")}
                  rightPlaceholder={t("monastery.aboutDescriptionArPlaceholder")}
                  textarea
                  rows={5}
                />
                <Form.Item name="about_image" label={t("monastery.aboutImage")}>
                  <Base64ImageUpload
                    buttonLabel={t("monastery.uploadAboutImage")}
                    emptyLabel={t("monastery.noImage")}
                    removeLabel={t("monastery.removeImage")}
                    errorLabel={t("monastery.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              <Card
                size="small"
                title={t("monastery.wallSection")}
                style={{ marginBottom: 24 }}
              >
                <BilingualTextFields
                  leftName="monastery_wall_description"
                  leftLabel={t("monastery.wallDescription")}
                  leftPlaceholder={t("monastery.wallDescriptionPlaceholder")}
                  rightName="monastery_wall_description_ar"
                  rightLabel={t("monastery.wallDescriptionAr")}
                  rightPlaceholder={t("monastery.wallDescriptionArPlaceholder")}
                  textarea
                  rows={5}
                />
                <Form.Item
                  name="monastery_wall_image"
                  label={t("monastery.wallImage")}
                >
                  <Base64ImageUpload
                    buttonLabel={t("monastery.uploadWallImage")}
                    emptyLabel={t("monastery.noImage")}
                    removeLabel={t("monastery.removeImage")}
                    errorLabel={t("monastery.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              <Card
                size="small"
                title={t("monastery.catacombSection")}
                style={{ marginBottom: 24 }}
              >
                <BilingualTextFields
                  leftName="catacomb_description"
                  leftLabel={t("monastery.catacombDescription")}
                  leftPlaceholder={t("monastery.catacombDescriptionPlaceholder")}
                  rightName="catacomb_description_ar"
                  rightLabel={t("monastery.catacombDescriptionAr")}
                  rightPlaceholder={t("monastery.catacombDescriptionArPlaceholder")}
                  textarea
                  rows={5}
                />
                <Form.Item
                  name="catacomb_image"
                  label={t("monastery.catacombImage")}
                >
                  <Base64ImageUpload
                    buttonLabel={t("monastery.uploadCatacombImage")}
                    emptyLabel={t("monastery.noImage")}
                    removeLabel={t("monastery.removeImage")}
                    errorLabel={t("monastery.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              <Card
                size="small"
                title={t("monastery.developmentSection")}
                style={{ marginBottom: 24 }}
              >
                <BilingualTextFields
                  leftName="monastery_development_description"
                  leftLabel={t("monastery.developmentDescription")}
                  leftPlaceholder={t("monastery.developmentDescriptionPlaceholder")}
                  rightName="monastery_development_description_ar"
                  rightLabel={t("monastery.developmentDescriptionAr")}
                  rightPlaceholder={t(
                    "monastery.developmentDescriptionArPlaceholder",
                  )}
                  textarea
                  rows={5}
                />
                <Divider />
                <DevelopmentImagesList t={t} />
              </Card>

              <Card
                size="small"
                title={t("monastery.historySection")}
                style={{ marginBottom: 24 }}
              >
                <HistoryList
                  t={t}
                  name="monastery_history"
                  titleKey="monastery.historyRows"
                  addLabelKey="monastery.addHistoryItem"
                />
              </Card>

              <Card
                size="small"
                title={t("monastery.papalSection")}
                style={{ marginBottom: 24 }}
              >
                <BilingualTextFields
                  leftName="papal_description"
                  leftLabel={t("monastery.papalDescription")}
                  leftPlaceholder={t("monastery.papalDescriptionPlaceholder")}
                  rightName="papal_description_ar"
                  rightLabel={t("monastery.papalDescriptionAr")}
                  rightPlaceholder={t("monastery.papalDescriptionArPlaceholder")}
                  textarea
                  rows={5}
                />
                <Form.Item name="papal_image" label={t("monastery.papalImage")}>
                  <Base64ImageUpload
                    buttonLabel={t("monastery.uploadPapalImage")}
                    emptyLabel={t("monastery.noImage")}
                    removeLabel={t("monastery.removeImage")}
                    errorLabel={t("monastery.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              <Card size="small" title={t("monastery.myronSection")}>
                <BilingualTextFields
                  leftName="myron_description"
                  leftLabel={t("monastery.myronDescription")}
                  leftPlaceholder={t("monastery.myronDescriptionPlaceholder")}
                  rightName="myron_description_ar"
                  rightLabel={t("monastery.myronDescriptionAr")}
                  rightPlaceholder={t("monastery.myronDescriptionArPlaceholder")}
                  textarea
                  rows={5}
                />
                <Divider />
                <HistoryList
                  t={t}
                  name="myron_timeline"
                  titleKey="monastery.myronTimeline"
                  addLabelKey="monastery.addTimelineItem"
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <ImagePreview
                  src={watchedCoverImage}
                  label={t("monastery.coverImage")}
                  emptyLabel={t("monastery.noImage")}
                />
                <ImagePreview
                  src={watchedAboutImage}
                  label={t("monastery.aboutImage")}
                  emptyLabel={t("monastery.noImage")}
                />
                <ImagePreview
                  src={watchedWallImage}
                  label={t("monastery.wallImage")}
                  emptyLabel={t("monastery.noImage")}
                />
                <ImagePreview
                  src={watchedCatacombImage}
                  label={t("monastery.catacombImage")}
                  emptyLabel={t("monastery.noImage")}
                />
                <ImagePreview
                  src={watchedPapalImage}
                  label={t("monastery.papalImage")}
                  emptyLabel={t("monastery.noImage")}
                />
              </Space>
            </Col>
          </Row>

          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              style={{ minWidth: 160 }}
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
