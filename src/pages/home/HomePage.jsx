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
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { HomeOutlined, SaveOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import apiService from "@/services/apiService";
import Base64ImageUpload from "@/components/Base64ImageUpload";

const { Title, Text } = Typography;
const { TextArea } = Input;

const DEFAULT_HOME = {
  id: "home_singleton",
  hero_image: "",
  hero_cta_text: "",
  hero_cta_text_ar: "",
  hero_cta_url: "",
  hero_title: "",
  hero_title_ar: "",
  hero_text: "",
  hero_text_ar: "",
  hero_monastery_description: "",
  hero_monastery_description_ar: "",
  hero_monastery_location: "",
  hero_monastery_location_ar: "",
  hero_monastery_hours: "",
  hero_monastery_hours_ar: "",
  spiritual_verse_verse: "",
  spiritual_verse_verse_ar: "",
  spiritual_verse_chapter: "",
  spiritual_verse_chapter_ar: "",
  about_text: "",
  about_text_ar: "",
  about_image: "",
  st_bishoy_bio_description: "",
  st_bishoy_bio_description_ar: "",
  st_bishoy_image: "",
  monastery_description: "",
  monastery_description_ar: "",
  monastery_image: "",
  area_description: "",
  area_description_ar: "",
  papa_description: "",
  papa_description_ar: "",
};

function normalizeText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeOptionalValue(value) {
  return value ? value : "";
}

function normalizeHome(payload) {
  const rawHome = payload?.data ?? payload ?? {};
  const hero = rawHome.hero ?? {};
  const spiritualVerse = rawHome.spiritual_verse ?? {};
  const about = rawHome.about ?? {};
  const stBishoyBio = rawHome.st_bishoy_bio ?? {};
  const monastery = rawHome.monastery ?? {};
  const area = rawHome.area ?? {};
  const papa = rawHome.papa ?? {};

  return {
    ...DEFAULT_HOME,
    id: rawHome.id ?? DEFAULT_HOME.id,
    hero_image: hero.image ?? "",
    hero_cta_text: hero.cta_text ?? "",
    hero_cta_text_ar: hero.cta_text_ar ?? "",
    hero_cta_url: hero.cta_url ?? "",
    hero_title: hero.title ?? "",
    hero_title_ar: hero.title_ar ?? "",
    hero_text: hero.text ?? "",
    hero_text_ar: hero.text_ar ?? "",
    hero_monastery_description: hero.monastery_description ?? "",
    hero_monastery_description_ar: hero.monastery_description_ar ?? "",
    hero_monastery_location: hero.monastery_location ?? "",
    hero_monastery_location_ar: hero.monastery_location_ar ?? "",
    hero_monastery_hours: hero.monastery_hours ?? "",
    hero_monastery_hours_ar: hero.monastery_hours_ar ?? "",
    spiritual_verse_verse: spiritualVerse.verse ?? "",
    spiritual_verse_verse_ar: spiritualVerse.verse_ar ?? "",
    spiritual_verse_chapter: spiritualVerse.chapter ?? "",
    spiritual_verse_chapter_ar: spiritualVerse.chapter_ar ?? "",
    about_text: about.text ?? "",
    about_text_ar: about.text_ar ?? "",
    about_image: about.image ?? "",
    st_bishoy_bio_description: stBishoyBio.description ?? "",
    st_bishoy_bio_description_ar: stBishoyBio.description_ar ?? "",
    st_bishoy_image: stBishoyBio.image ?? "",
    monastery_description: monastery.description ?? "",
    monastery_description_ar: monastery.description_ar ?? "",
    monastery_image: monastery.image ?? "",
    area_description: area.description ?? "",
    area_description_ar: area.description_ar ?? "",
    papa_description: papa.description ?? "",
    papa_description_ar: papa.description_ar ?? "",
  };
}

function buildHomePayload(values) {
  return {
    hero_image: normalizeOptionalValue(values.hero_image),
    hero_cta_text: normalizeText(values.hero_cta_text),
    hero_cta_text_ar: normalizeText(values.hero_cta_text_ar),
    hero_cta_url: normalizeText(values.hero_cta_url),
    hero_title: normalizeText(values.hero_title),
    hero_title_ar: normalizeText(values.hero_title_ar),
    hero_text: normalizeText(values.hero_text),
    hero_text_ar: normalizeText(values.hero_text_ar),
    hero_monastery_description: normalizeText(
      values.hero_monastery_description,
    ),
    hero_monastery_description_ar: normalizeText(
      values.hero_monastery_description_ar,
    ),
    hero_monastery_location: normalizeText(values.hero_monastery_location),
    hero_monastery_location_ar: normalizeText(
      values.hero_monastery_location_ar,
    ),
    hero_monastery_hours: normalizeText(values.hero_monastery_hours),
    hero_monastery_hours_ar: normalizeText(values.hero_monastery_hours_ar),
    spiritual_verse_verse: normalizeText(values.spiritual_verse_verse),
    spiritual_verse_verse_ar: normalizeText(values.spiritual_verse_verse_ar),
    spiritual_verse_chapter: normalizeText(values.spiritual_verse_chapter),
    spiritual_verse_chapter_ar: normalizeText(
      values.spiritual_verse_chapter_ar,
    ),
    about_text: normalizeText(values.about_text),
    about_text_ar: normalizeText(values.about_text_ar),
    about_image: normalizeOptionalValue(values.about_image),
    st_bishoy_bio_description: normalizeText(values.st_bishoy_bio_description),
    st_bishoy_bio_description_ar: normalizeText(
      values.st_bishoy_bio_description_ar,
    ),
    st_bishoy_image: normalizeOptionalValue(values.st_bishoy_image),
    monastery_description: normalizeText(values.monastery_description),
    monastery_description_ar: normalizeText(values.monastery_description_ar),
    monastery_image: normalizeOptionalValue(values.monastery_image),
    area_description: normalizeText(values.area_description),
    area_description_ar: normalizeText(values.area_description_ar),
    papa_description: normalizeText(values.papa_description),
    papa_description_ar: normalizeText(values.papa_description_ar),
  };
}

export default function HomePage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [homeId, setHomeId] = useState(DEFAULT_HOME.id);
  const [initialHome, setInitialHome] = useState(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const SECTION_KEYS = [
    "hero",
    "spiritual_verse",
    "about",
    "st_bishoy_bio",
    "monastery",
    "area",
    "papa",
  ];

  const activeSectionParam = searchParams.get("section");
  const activeSection = SECTION_KEYS.includes(activeSectionParam)
    ? activeSectionParam
    : "hero";

  const SECTION_FIELDS = {
    hero: [
      "hero_image",
      "hero_cta_text",
      "hero_cta_text_ar",
      "hero_cta_url",
      "hero_title",
      "hero_title_ar",
      "hero_text",
      "hero_text_ar",
      "hero_monastery_description",
      "hero_monastery_description_ar",
      "hero_monastery_location",
      "hero_monastery_location_ar",
      "hero_monastery_hours",
      "hero_monastery_hours_ar",
    ],
    spiritual_verse: [
      "spiritual_verse_verse",
      "spiritual_verse_verse_ar",
      "spiritual_verse_chapter",
      "spiritual_verse_chapter_ar",
    ],
    about: ["about_text", "about_text_ar", "about_image"],
    st_bishoy_bio: [
      "st_bishoy_bio_description",
      "st_bishoy_bio_description_ar",
      "st_bishoy_image",
    ],
    monastery: [
      "monastery_description",
      "monastery_description_ar",
      "monastery_image",
    ],
    area: ["area_description", "area_description_ar"],
    papa: ["papa_description", "papa_description_ar"],
  };

  const handleSelectSection = (key) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      next.set("section", key);
      return next;
    });
  };

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        const response = await apiService.get("/home");
        const normalizedHome = normalizeHome(response.data);
        setHomeId(normalizedHome.id || DEFAULT_HOME.id);
        setInitialHome(normalizedHome);
        form.setFieldsValue(normalizedHome);
      } catch (error) {
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            t("home.fetchError"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
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

      const nextValues = buildHomePayload(values);
      const payload = {};
      const sectionFields = SECTION_FIELDS[activeSection] ?? [];

      for (const [key, value] of Object.entries(nextValues)) {
        if (!sectionFields.includes(key)) continue;

        if (value !== initialHome[key]) {
          payload[key] = value;
        }
      }

      if (!Object.keys(payload).length) {
        message.info(t("common.noChanges"));
        setSaving(false);
        return;
      }

      const response = await apiService.put("/home", payload);
      const nextBaselineSource = response?.data?.data
        ? response.data
        : { ...initialHome, ...nextValues, ...payload, id: homeId };
      const normalizedHome = normalizeHome(nextBaselineSource);
      setHomeId(normalizedHome.id || homeId);
      setInitialHome(normalizedHome);
      form.setFieldsValue(normalizedHome);
      message.success(t("home.saveSuccess"));
    } catch (error) {
      const details = error?.details || error?.response?.data?.details;
      if (applyBackendValidationErrors(details)) {
        message.error(error?.error || error?.response?.data?.error || t("home.saveError"));
        return;
      }

      message.error(
        error?.response?.data?.message || error?.message || t("home.saveError"),
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
            <HomeOutlined style={{ color: "#6B1A1A" }} />
            {t("home.title")}
          </Title>
          <Text type="secondary">
            {t("home.singletonId")}: {homeId}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={DEFAULT_HOME}
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
                      { key: "hero", label: t("home.heroSection") },
                      {
                        key: "spiritual_verse",
                        label: t("home.spiritualVerseSection"),
                      },
                      { key: "about", label: t("home.aboutSection") },
                      { key: "st_bishoy_bio", label: t("home.stBishoyBioSection") },
                      { key: "monastery", label: t("home.monasterySection") },
                      { key: "area", label: t("home.areaSection") },
                      { key: "papa", label: t("home.papaSection") },
                    ]}
                  />
                </Card>
              </div>
            </Col>

            <Col xs={24} lg={18}>
              {activeSection === "hero" ? (
                <Card size="small" title={t("home.heroSection")} style={{ borderRadius: 12 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="hero_title" label={t("home.heroTitle")}>
                        <Input placeholder={t("home.heroTitlePlaceholder")} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_title_ar"
                        label={t("home.heroTitleAr")}
                      >
                        <Input
                          dir="rtl"
                          placeholder={t("home.heroTitleArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="hero_text" label={t("home.heroText")}>
                        <TextArea
                          rows={4}
                          placeholder={t("home.heroTextPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="hero_text_ar" label={t("home.heroTextAr")}>
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.heroTextArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_cta_text"
                        label={t("home.heroCtaText")}
                      >
                        <Input placeholder={t("home.heroCtaTextPlaceholder")} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_cta_text_ar"
                        label={t("home.heroCtaTextAr")}
                      >
                        <Input
                          dir="rtl"
                          placeholder={t("home.heroCtaTextArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="hero_cta_url"
                    label={t("home.heroCtaUrl")}
                    rules={[
                      {
                        type: "url",
                        warningOnly: true,
                        message: t("validation.url"),
                      },
                    ]}
                  >
                    <Input placeholder={t("home.heroCtaUrlPlaceholder")} />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_monastery_description"
                        label={t("home.heroMonasteryDescription")}
                      >
                        <TextArea
                          rows={4}
                          placeholder={t("home.heroMonasteryDescriptionPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_monastery_description_ar"
                        label={t("home.heroMonasteryDescriptionAr")}
                      >
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.heroMonasteryDescriptionArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_monastery_location"
                        label={t("home.heroMonasteryLocation")}
                      >
                        <Input
                          placeholder={t("home.heroMonasteryLocationPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_monastery_location_ar"
                        label={t("home.heroMonasteryLocationAr")}
                      >
                        <Input
                          dir="rtl"
                          placeholder={t("home.heroMonasteryLocationArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_monastery_hours"
                        label={t("home.heroMonasteryHours")}
                      >
                        <Input
                          placeholder={t("home.heroMonasteryHoursPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hero_monastery_hours_ar"
                        label={t("home.heroMonasteryHoursAr")}
                      >
                        <Input
                          dir="rtl"
                          placeholder={t("home.heroMonasteryHoursArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="hero_image" label={t("home.heroImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("home.uploadHeroImage")}
                      emptyLabel={t("home.noImage")}
                      removeLabel={t("home.removeImage")}
                      errorLabel={t("home.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "spiritual_verse" ? (
                <Card
                  size="small"
                  title={t("home.spiritualVerseSection")}
                  style={{ borderRadius: 12 }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="spiritual_verse_verse"
                        label={t("home.spiritualVerseVerse")}
                      >
                        <TextArea
                          rows={3}
                          placeholder={t("home.spiritualVerseVersePlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="spiritual_verse_verse_ar"
                        label={t("home.spiritualVerseVerseAr")}
                      >
                        <TextArea
                          rows={3}
                          dir="rtl"
                          placeholder={t("home.spiritualVerseVerseArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="spiritual_verse_chapter"
                        label={t("home.spiritualVerseChapter")}
                      >
                        <Input
                          placeholder={t("home.spiritualVerseChapterPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="spiritual_verse_chapter_ar"
                        label={t("home.spiritualVerseChapterAr")}
                      >
                        <Input
                          dir="rtl"
                          placeholder={t("home.spiritualVerseChapterArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ) : null}

              {activeSection === "about" ? (
                <Card size="small" title={t("home.aboutSection")} style={{ borderRadius: 12 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="about_text" label={t("home.aboutText")}>
                        <TextArea
                          rows={4}
                          placeholder={t("home.aboutTextPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="about_text_ar"
                        label={t("home.aboutTextAr")}
                      >
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.aboutTextArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="about_image" label={t("home.aboutImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("home.uploadAboutImage")}
                      emptyLabel={t("home.noImage")}
                      removeLabel={t("home.removeImage")}
                      errorLabel={t("home.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "st_bishoy_bio" ? (
                <Card
                  size="small"
                  title={t("home.stBishoyBioSection")}
                  style={{ borderRadius: 12 }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="st_bishoy_bio_description"
                        label={t("home.stBishoyBioDescription")}
                      >
                        <TextArea
                          rows={4}
                          placeholder={t("home.stBishoyBioDescriptionPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="st_bishoy_bio_description_ar"
                        label={t("home.stBishoyBioDescriptionAr")}
                      >
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.stBishoyBioDescriptionArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="st_bishoy_image"
                    label={t("home.stBishoyBioImage")}
                  >
                    <Base64ImageUpload
                      buttonLabel={t("home.uploadStBishoyBioImage")}
                      emptyLabel={t("home.noImage")}
                      removeLabel={t("home.removeImage")}
                      errorLabel={t("home.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "monastery" ? (
                <Card
                  size="small"
                  title={t("home.monasterySection")}
                  style={{ borderRadius: 12 }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="monastery_description"
                        label={t("home.monasteryDescription")}
                      >
                        <TextArea
                          rows={4}
                          placeholder={t("home.monasteryDescriptionPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="monastery_description_ar"
                        label={t("home.monasteryDescriptionAr")}
                      >
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.monasteryDescriptionArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="monastery_image" label={t("home.monasteryImage")}>
                    <Base64ImageUpload
                      buttonLabel={t("home.uploadMonasteryImage")}
                      emptyLabel={t("home.noImage")}
                      removeLabel={t("home.removeImage")}
                      errorLabel={t("home.imageProcessError")}
                    />
                  </Form.Item>
                </Card>
              ) : null}

              {activeSection === "area" ? (
                <Card size="small" title={t("home.areaSection")} style={{ borderRadius: 12 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="area_description"
                        label={t("home.areaDescription")}
                      >
                        <TextArea
                          rows={4}
                          placeholder={t("home.areaDescriptionPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="area_description_ar"
                        label={t("home.areaDescriptionAr")}
                      >
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.areaDescriptionArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ) : null}

              {activeSection === "papa" ? (
                <Card size="small" title={t("home.papaSection")} style={{ borderRadius: 12 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="papa_description"
                        label={t("home.papaDescription")}
                      >
                        <TextArea
                          rows={4}
                          placeholder={t("home.papaDescriptionPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="papa_description_ar"
                        label={t("home.papaDescriptionAr")}
                      >
                        <TextArea
                          rows={4}
                          dir="rtl"
                          placeholder={t("home.papaDescriptionArPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
