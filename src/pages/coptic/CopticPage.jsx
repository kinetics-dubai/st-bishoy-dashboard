import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Menu,
  Row,
  Spin,
  Typography,
  message,
} from "antd";
import { BookOutlined, SaveOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import apiService from "@/services/apiService";
import Base64ImageUpload from "@/components/Base64ImageUpload";

const { Title, Text } = Typography;
const { TextArea } = Input;

const DEFAULT_COPTIC = {
  id: "coptic_singleton",
  cover_image: "",
  pope_shenoda_shrine: "",
  pope_shenoda_shrine_ar: "",
  pope_shenoda_shrine_image: "",
  anba_sarabamon_shrine: "",
  anba_sarabamon_shrine_ar: "",
  anba_sarabamon_shrine_image: "",
  departed_description: "",
};

function normalizeText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeOptionalValue(value) {
  return value ? String(value) : "";
}

function normalizeCoptic(payload) {
  const raw = payload?.data ?? payload ?? {};
  return {
    ...DEFAULT_COPTIC,
    id: raw.id ?? DEFAULT_COPTIC.id,
    cover_image: normalizeOptionalValue(raw.cover_image),
    pope_shenoda_shrine: normalizeText(raw.pope_shenoda_shrine),
    pope_shenoda_shrine_ar: normalizeText(raw.pope_shenoda_shrine_ar),
    pope_shenoda_shrine_image: normalizeOptionalValue(raw.pope_shenoda_shrine_image),
    anba_sarabamon_shrine: normalizeText(raw.anba_sarabamon_shrine),
    anba_sarabamon_shrine_ar: normalizeText(raw.anba_sarabamon_shrine_ar),
    anba_sarabamon_shrine_image: normalizeOptionalValue(raw.anba_sarabamon_shrine_image),
    departed_description: normalizeText(raw.departed_description),
  };
}

function buildCopticSnapshot(values) {
  return {
    cover_image: normalizeOptionalValue(values.cover_image),
    pope_shenoda_shrine: normalizeText(values.pope_shenoda_shrine),
    pope_shenoda_shrine_ar: normalizeText(values.pope_shenoda_shrine_ar),
    pope_shenoda_shrine_image: normalizeOptionalValue(values.pope_shenoda_shrine_image),
    anba_sarabamon_shrine: normalizeText(values.anba_sarabamon_shrine),
    anba_sarabamon_shrine_ar: normalizeText(values.anba_sarabamon_shrine_ar),
    anba_sarabamon_shrine_image: normalizeOptionalValue(values.anba_sarabamon_shrine_image),
    departed_description: normalizeText(values.departed_description),
  };
}

function BilingualTextFields({
  leftName,
  leftLabel,
  leftPlaceholder,
  rightName,
  rightLabel,
  rightPlaceholder,
  rows = 4,
}) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name={leftName} label={leftLabel}>
          <TextArea rows={rows} placeholder={leftPlaceholder} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name={rightName} label={rightLabel}>
          <TextArea rows={rows} dir="rtl" placeholder={rightPlaceholder} />
        </Form.Item>
      </Col>
    </Row>
  );
}

const SECTION_KEYS = ["cover", "pope_shenoda", "anba_sarabamon", "departed"];

const SECTION_FIELDS = {
  cover: ["cover_image"],
  pope_shenoda: ["pope_shenoda_shrine", "pope_shenoda_shrine_ar", "pope_shenoda_shrine_image"],
  anba_sarabamon: ["anba_sarabamon_shrine", "anba_sarabamon_shrine_ar", "anba_sarabamon_shrine_image"],
  departed: ["departed_description"],
};

export default function CopticPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copticId, setCopticId] = useState(DEFAULT_COPTIC.id);
  const [initialCoptic, setInitialCoptic] = useState(DEFAULT_COPTIC);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeSectionParam = searchParams.get("section");
  const activeSection = SECTION_KEYS.includes(activeSectionParam)
    ? activeSectionParam
    : "cover";

  const handleSelectSection = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("section", key);
      return next;
    });
  };

  const fetchCoptic = async ({ showLoadingSpinner = true } = {}) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const response = await apiService.get("/coptic");
      const normalized = normalizeCoptic(response.data);
      setCopticId(normalized.id || DEFAULT_COPTIC.id);
      setInitialCoptic(normalized);
      form.setFieldsValue(normalized);
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          t("coptic.fetchError"),
      );
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoptic();
  }, []);

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

      const nextValues = buildCopticSnapshot(values);
      const payload = {};
      const sectionFields = SECTION_FIELDS[activeSection] ?? [];

      for (const [key, value] of Object.entries(nextValues)) {
        if (!sectionFields.includes(key)) continue;
        if (value !== initialCoptic[key]) {
          payload[key] = value;
        }
      }

      if (!Object.keys(payload).length) {
        message.info(t("common.noChanges"));
        setSaving(false);
        return;
      }

      await apiService.put("/coptic", payload);
      await fetchCoptic({ showLoadingSpinner: false });
      message.success(t("coptic.saveSuccess"));
    } catch (error) {
      const details = error?.details || error?.response?.data?.details;
      if (applyBackendValidationErrors(details)) {
        message.error(
          error?.error ||
            error?.response?.data?.error ||
            t("coptic.saveError"),
        );
        return;
      }
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          t("coptic.saveError"),
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
            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
          >
            <BookOutlined style={{ color: "#6B1A1A" }} />
            {t("coptic.title")}
          </Title>
          <Text type="secondary">
            {t("coptic.singletonId")}: {copticId}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={DEFAULT_COPTIC}
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
                      { key: "cover", label: t("coptic.coverSection") },
                      { key: "pope_shenoda", label: t("coptic.popeShenodaSection") },
                      { key: "anba_sarabamon", label: t("coptic.anbaSarabamonSection") },
                      { key: "departed", label: t("coptic.departedSection") },
                    ]}
                  />
                </Card>
              </div>
            </Col>

            <Col xs={24} lg={18}>
              {activeSection === "cover" ? (
                <Card
                  size="small"
                  title={t("coptic.coverSection")}
                  style={{ borderRadius: 12 }}
                >
                  <Form.Item name="cover_image" label={t("coptic.coverImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("coptic.uploadCoverImage")}
                      emptyLabel={t("coptic.noImage")}
                      removeLabel={t("coptic.removeImage")}
                      errorLabel={t("coptic.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "pope_shenoda" ? (
                <Card
                  size="small"
                  title={t("coptic.popeShenodaSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="pope_shenoda_shrine"
                    leftLabel={t("coptic.popeShenodaShrine")}
                    leftPlaceholder={t("coptic.popeShenodaShrinePlaceholder")}
                    rightName="pope_shenoda_shrine_ar"
                    rightLabel={t("coptic.popeShenodaShrineAr")}
                    rightPlaceholder={t("coptic.popeShenodaShrineArPlaceholder")}
                    rows={5}
                  />
                  <Form.Item
                    name="pope_shenoda_shrine_image"
                    label={t("coptic.popeShenodaShrineImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("coptic.uploadPopeShenodaImage")}
                      emptyLabel={t("coptic.noImage")}
                      removeLabel={t("coptic.removeImage")}
                      errorLabel={t("coptic.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "anba_sarabamon" ? (
                <Card
                  size="small"
                  title={t("coptic.anbaSarabamonSection")}
                  style={{ borderRadius: 12 }}
                >
                  <BilingualTextFields
                    leftName="anba_sarabamon_shrine"
                    leftLabel={t("coptic.anbaSarabamonShrine")}
                    leftPlaceholder={t("coptic.anbaSarabamonShrinePlaceholder")}
                    rightName="anba_sarabamon_shrine_ar"
                    rightLabel={t("coptic.anbaSarabamonShrineAr")}
                    rightPlaceholder={t("coptic.anbaSarabamonShrineArPlaceholder")}
                    rows={5}
                  />
                  <Form.Item
                    name="anba_sarabamon_shrine_image"
                    label={t("coptic.anbaSarabamonShrineImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("coptic.uploadAnbaSarabamonImage")}
                      emptyLabel={t("coptic.noImage")}
                      removeLabel={t("coptic.removeImage")}
                      errorLabel={t("coptic.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "departed" ? (
                <Card
                  size="small"
                  title={t("coptic.departedSection")}
                  style={{ borderRadius: 12 }}
                >
                  <Form.Item
                    name="departed_description"
                    label={t("coptic.departedDescription")}
                  >
                    <TextArea
                      rows={6}
                      placeholder={t("coptic.departedDescriptionPlaceholder")}
                    />
                  </Form.Item>
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
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
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
