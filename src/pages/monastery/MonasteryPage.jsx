import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Menu,
  Row,
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

const { Title, Text } = Typography;
const { TextArea } = Input;

const HISTORY_ITEM_SHAPE = {
  date: "",
  date_ar: "",
  text: "",
  text_ar: "",
};

const MYRON_TIMELINE_ITEM_SHAPE = {
  date: "",
  text: "",
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
  myron_image: "",
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

function coerceToArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray(value.content)) {
    return value.content;
  }
  if (value && typeof value === "object" && Array.isArray(value.timeline)) {
    return value.timeline;
  }
  return [];
}

function normalizeLegacyTimeline(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    const text = normalizeText(value.text ?? "");
    const text_ar = normalizeText(value.text_ar ?? "");
    if (!text && !text_ar) return [];
    return [{ ...HISTORY_ITEM_SHAPE, text, text_ar }];
  }
  if (typeof value === "string") {
    const text = normalizeText(value);
    if (!text) return [];
    return [{ ...HISTORY_ITEM_SHAPE, text }];
  }
  return [];
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

  const historySource =
    rawMonastery.monastery_history ??
    (Array.isArray(rawMonastery.history) ? rawMonastery.history : null) ??
    history.content;
  const myronTimelineSource = rawMonastery.myron_timeline ?? myron.timeline;

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
      rawMonastery.monastery_wall_description_ar ??
        monasteryWall.description_ar,
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
    papal_image: normalizeOptionalValue(
      rawMonastery.papal_image ?? papal.image,
    ),
    myron_description: normalizeText(
      rawMonastery.myron_description ?? myron.description,
    ),
    myron_description_ar: normalizeText(
      rawMonastery.myron_description_ar ?? myron.description_ar,
    ),
    myron_image: normalizeOptionalValue(
      rawMonastery.myron_image ?? myron.image,
    ),
    monastery_history: normalizeList(
      coerceToArray(historySource),
      HISTORY_ITEM_SHAPE,
    ),
    myron_timeline: normalizeList(
      coerceToArray(myronTimelineSource).length
        ? coerceToArray(myronTimelineSource)
        : normalizeLegacyTimeline(myronTimelineSource),
      MYRON_TIMELINE_ITEM_SHAPE,
    ),
    monastery_development_images: normalizeList(
      rawMonastery.monastery_development_images,
      DEVELOPMENT_IMAGE_SHAPE,
    ),
  };
}

function buildMonasterySnapshot(values) {
  return {
    cover_image: normalizeOptionalValue(values.cover_image),
    about_description: normalizeText(values.about_description),
    about_description_ar: normalizeText(values.about_description_ar),
    about_image: normalizeOptionalValue(values.about_image),
    monastery_wall_description: normalizeText(
      values.monastery_wall_description,
    ),
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
    myron_image: normalizeOptionalValue(values.myron_image),
    monastery_history: normalizeList(
      values.monastery_history,
      HISTORY_ITEM_SHAPE,
    ),
    myron_timeline: normalizeList(
      values.myron_timeline,
      MYRON_TIMELINE_ITEM_SHAPE,
    ),
    monastery_development_images: normalizeList(
      values.monastery_development_images,
      DEVELOPMENT_IMAGE_SHAPE,
    ),
  };
}

function BilingualTextFields({
  leftName,
  leftLabel,
  leftPlaceholder,
  leftRules,
  rightName,
  rightLabel,
  rightPlaceholder,
  rightRules,
  rows = 4,
  textarea = false,
}) {
  const Component = textarea ? TextArea : Input;

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name={leftName} label={leftLabel} rules={leftRules}>
          <Component
            rows={textarea ? rows : undefined}
            placeholder={leftPlaceholder}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name={rightName} label={rightLabel} rules={rightRules}>
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
                leftName={[field.name, "date"]}
                leftLabel={t("monastery.rowDate")}
                leftPlaceholder={t("monastery.rowDatePlaceholder")}
                rightName={[field.name, "date_ar"]}
                rightLabel={t("monastery.rowDateAr")}
                rightPlaceholder={t("monastery.rowDateArPlaceholder")}
              />
              <BilingualTextFields
                leftName={[field.name, "text"]}
                leftLabel={t("monastery.rowText")}
                leftPlaceholder={t("monastery.rowTextPlaceholder")}
                rightName={[field.name, "text_ar"]}
                rightLabel={t("monastery.rowTextAr")}
                rightPlaceholder={t("monastery.rowTextArPlaceholder")}
                textarea
                rows={5}
              />
            </Card>
          ))}
          <RepeaterHeader
            title={t(titleKey)}
            addLabel={t(addLabelKey)}
            onAdd={() => add({ ...HISTORY_ITEM_SHAPE })}
          />
        </>
      )}
    </Form.List>
  );
}

function MyronTimelineList({ t }) {
  return (
    <Form.List name="myron_timeline">
      {(fields, { add, remove }) => (
        <>
          <RepeaterHeader
            title={t("monastery.myronTimeline")}
            addLabel={t("monastery.addTimelineItem")}
            onAdd={() => add({ ...MYRON_TIMELINE_ITEM_SHAPE })}
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
              <Form.Item
                name={[field.name, "date"]}
                label={t("monastery.rowDate")}
              >
                <Input
                  dir="rtl"
                  placeholder={t("monastery.rowDatePlaceholder")}
                />
              </Form.Item>
              <Form.Item
                name={[field.name, "text"]}
                label={t("monastery.rowText")}
              >
                <TextArea
                  rows={4}
                  dir="rtl"
                  placeholder={t("monastery.rowTextPlaceholder")}
                />
              </Form.Item>
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
                <Col xs={24}>
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
                    leftRules={[
                      { required: true, message: t("validation.required") },
                    ]}
                    rightName={[field.name, "caption_ar"]}
                    rightLabel={t("monastery.captionAr")}
                    rightPlaceholder={t("monastery.captionArPlaceholder")}
                    rightRules={[
                      { required: true, message: t("validation.required") },
                    ]}
                  />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [monasteryId, setMonasteryId] = useState(DEFAULT_MONASTERY.id);
  const [initialMonastery, setInitialMonastery] = useState(DEFAULT_MONASTERY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const SECTION_KEYS = [
    "cover",
    "about",
    "wall",
    "catacomb",
    "development",
    "history",
    "papal",
    "myron",
  ];

  const activeSectionParam = searchParams.get("section");
  const activeSection = SECTION_KEYS.includes(activeSectionParam)
    ? activeSectionParam
    : "cover";

  const SECTION_FIELDS = {
    cover: ["cover_image"],
    about: ["about_description", "about_description_ar", "about_image"],
    wall: [
      "monastery_wall_description",
      "monastery_wall_description_ar",
      "monastery_wall_image",
    ],
    catacomb: [
      "catacomb_description",
      "catacomb_description_ar",
      "catacomb_image",
    ],
    development: [
      "monastery_development_description",
      "monastery_development_description_ar",
      "monastery_development_images",
    ],
    history: ["monastery_history"],
    papal: ["papal_description", "papal_description_ar", "papal_image"],
    myron: [
      "myron_description",
      "myron_description_ar",
      "myron_image",
      "myron_timeline",
    ],
  };

  const handleSelectSection = (key) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      next.set("section", key);
      return next;
    });
  };

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

  const applyBackendValidationErrors = (details) => {
    if (!Array.isArray(details) || !details.length) return false;

    const toNamePath = (field) =>
      String(field)
        .split(".")
        .filter(Boolean)
        .map((part) => (part.match(/^\d+$/) ? Number(part) : part));

    form.setFields(
      details
        .filter((item) => item?.field)
        .map((item) => ({
          name: toNamePath(item.field),
          errors: [String(item?.message || t("common.error"))],
        })),
    );

    return true;
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      form.setFields(
        form
          .getFieldsError()
          .filter((f) => f.errors?.length)
          .map((f) => ({ name: f.name, errors: [] })),
      );

      const nextValues = buildMonasterySnapshot(values);
      const payload = {};
      const sectionFields = SECTION_FIELDS[activeSection] ?? [];

      for (const [key, value] of Object.entries(nextValues)) {
        if (!sectionFields.includes(key)) continue;

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
      const details = error?.details || error?.response?.data?.details;
      if (applyBackendValidationErrors(details)) {
        message.error(
          error?.error ||
            error?.response?.data?.error ||
            t("monastery.saveError"),
        );
        return;
      }

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          t("monastery.saveError"),
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
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AppstoreOutlined style={{ color: "#6B1A1A" }} />
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
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={6}>
              <div style={{ position: "sticky", top: 16 }}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <Menu
                    mode="inline"
                    selectedKeys={[activeSection]}
                    onClick={(e) => handleSelectSection(e.key)}
                    items={[
                      { key: "cover", label: t("monastery.coverSection") },
                      { key: "about", label: t("monastery.aboutSection") },
                      { key: "wall", label: t("monastery.wallSection") },
                      {
                        key: "catacomb",
                        label: t("monastery.catacombSection"),
                      },
                      {
                        key: "development",
                        label: t("monastery.developmentSection"),
                      },
                      { key: "history", label: t("monastery.historySection") },
                      { key: "papal", label: t("monastery.papalSection") },
                      { key: "myron", label: t("monastery.myronSection") },
                    ]}
                  />
                </Card>
              </div>
            </Col>

            <Col xs={24} lg={18}>
              {activeSection === "cover" ? (
                <Card
                  size="small"
                  title={t("monastery.coverSection")}
                  style={{ borderRadius: 12 }}
                >
                  <Form.Item
                    name="cover_image"
                    label={t("monastery.coverImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("monastery.uploadCoverImage")}
                      emptyLabel={t("monastery.noImage")}
                      removeLabel={t("monastery.removeImage")}
                      errorLabel={t("monastery.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "about" ? (
                <Card
                  size="small"
                  title={t("monastery.aboutSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="about_description"
                    leftLabel={t("monastery.aboutDescription")}
                    leftPlaceholder={t("monastery.aboutDescriptionPlaceholder")}
                    rightName="about_description_ar"
                    rightLabel={t("monastery.aboutDescriptionAr")}
                    rightPlaceholder={t(
                      "monastery.aboutDescriptionArPlaceholder",
                    )}
                    textarea
                    rows={5}
                  />
                  <Form.Item
                    name="about_image"
                    label={t("monastery.aboutImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("monastery.uploadAboutImage")}
                      emptyLabel={t("monastery.noImage")}
                      removeLabel={t("monastery.removeImage")}
                      errorLabel={t("monastery.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "wall" ? (
                <Card
                  size="small"
                  title={t("monastery.wallSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="monastery_wall_description"
                    leftLabel={t("monastery.wallDescription")}
                    leftPlaceholder={t("monastery.wallDescriptionPlaceholder")}
                    rightName="monastery_wall_description_ar"
                    rightLabel={t("monastery.wallDescriptionAr")}
                    rightPlaceholder={t(
                      "monastery.wallDescriptionArPlaceholder",
                    )}
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
              ) : null}

              {activeSection === "catacomb" ? (
                <Card
                  size="small"
                  title={t("monastery.catacombSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="catacomb_description"
                    leftLabel={t("monastery.catacombDescription")}
                    leftPlaceholder={t(
                      "monastery.catacombDescriptionPlaceholder",
                    )}
                    rightName="catacomb_description_ar"
                    rightLabel={t("monastery.catacombDescriptionAr")}
                    rightPlaceholder={t(
                      "monastery.catacombDescriptionArPlaceholder",
                    )}
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
              ) : null}

              {activeSection === "development" ? (
                <Card
                  size="small"
                  title={t("monastery.developmentSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="monastery_development_description"
                    leftLabel={t("monastery.developmentDescription")}
                    leftPlaceholder={t(
                      "monastery.developmentDescriptionPlaceholder",
                    )}
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
              ) : null}

              {activeSection === "history" ? (
                <Card
                  size="small"
                  title={t("monastery.historySection")}
                  style={{ borderRadius: 12 }}
                >
                  <HistoryList
                    t={t}
                    name="monastery_history"
                    titleKey="monastery.historyRows"
                    addLabelKey="monastery.addHistoryItem"
                  />
                </Card>
              ) : null}

              {activeSection === "papal" ? (
                <Card
                  size="small"
                  title={t("monastery.papalSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="papal_description"
                    leftLabel={t("monastery.papalDescription")}
                    leftPlaceholder={t("monastery.papalDescriptionPlaceholder")}
                    rightName="papal_description_ar"
                    rightLabel={t("monastery.papalDescriptionAr")}
                    rightPlaceholder={t(
                      "monastery.papalDescriptionArPlaceholder",
                    )}
                    textarea
                    rows={5}
                  />
                  <Form.Item
                    name="papal_image"
                    label={t("monastery.papalImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("monastery.uploadPapalImage")}
                      emptyLabel={t("monastery.noImage")}
                      removeLabel={t("monastery.removeImage")}
                      errorLabel={t("monastery.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "myron" ? (
                <Card
                  size="small"
                  title={t("monastery.myronSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="myron_description"
                    leftLabel={t("monastery.myronDescription")}
                    leftPlaceholder={t("monastery.myronDescriptionPlaceholder")}
                    rightName="myron_description_ar"
                    rightLabel={t("monastery.myronDescriptionAr")}
                    rightPlaceholder={t(
                      "monastery.myronDescriptionArPlaceholder",
                    )}
                    textarea
                    rows={5}
                  />
                  <Form.Item
                    name="myron_image"
                    label={t("monastery.myronImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("monastery.uploadMyronImage")}
                      emptyLabel={t("monastery.noImage")}
                      removeLabel={t("monastery.removeImage")}
                      errorLabel={t("monastery.imageProcessError")}
                    />
                  </Form.Item>
                  <Divider />
                  <MyronTimelineList t={t} />
                </Card>
              ) : null}

              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  marginTop: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                  background:
                    "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                    style={{ minWidth: 160, background: "#6B1A1A" }}
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
