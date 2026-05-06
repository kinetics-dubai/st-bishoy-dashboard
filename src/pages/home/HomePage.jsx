import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
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
import { resolveMediaUrl } from "@/lib/mediaUrl";

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

export default function HomePage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [homeId, setHomeId] = useState(DEFAULT_HOME.id);
  const [initialHome, setInitialHome] = useState(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const watchedHeroImage = Form.useWatch("hero_image", form);
  const watchedAboutImage = Form.useWatch("about_image", form);
  const watchedStBishoyBioImage = Form.useWatch("st_bishoy_image", form);
  const watchedMonasteryImage = Form.useWatch("monastery_image", form);

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

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const nextValues = buildHomePayload(values);
      const payload = Object.fromEntries(
        Object.entries(nextValues).filter(
          ([key, value]) => value !== initialHome[key],
        ),
      );

      if (!Object.keys(payload).length) {
        message.info(t("common.noChanges"));
        setSaving(false);
        return;
      }

      const response = await apiService.put("/home", payload);
      const normalizedHome = normalizeHome(
        response?.data?.data ? response.data : (response.data ?? nextValues),
      );
      setHomeId(normalizedHome.id || homeId);
      setInitialHome(normalizedHome);
      form.setFieldsValue(normalizedHome);
      message.success(t("home.saveSuccess"));
    } catch (error) {
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
            <HomeOutlined style={{ color: "#5C1A1B" }} />
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
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={16}>
              <Card
                size="small"
                title={t("home.heroSection")}
                style={{ marginBottom: 24 }}
              >
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
                        placeholder={t(
                          "home.heroMonasteryDescriptionPlaceholder",
                        )}
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
                        placeholder={t(
                          "home.heroMonasteryDescriptionArPlaceholder",
                        )}
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
                        placeholder={t(
                          "home.heroMonasteryLocationArPlaceholder",
                        )}
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

              <Card
                size="small"
                title={t("home.spiritualVerseSection")}
                style={{ marginBottom: 24 }}
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
                        placeholder={t(
                          "home.spiritualVerseChapterArPlaceholder",
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                size="small"
                title={t("home.aboutSection")}
                style={{ marginBottom: 24 }}
              >
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

              <Card
                size="small"
                title={t("home.stBishoyBioSection")}
                style={{ marginBottom: 24 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="st_bishoy_bio_description"
                      label={t("home.stBishoyBioDescription")}
                    >
                      <TextArea
                        rows={4}
                        placeholder={t(
                          "home.stBishoyBioDescriptionPlaceholder",
                        )}
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
                        placeholder={t(
                          "home.stBishoyBioDescriptionArPlaceholder",
                        )}
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

              <Card
                size="small"
                title={t("home.monasterySection")}
                style={{ marginBottom: 24 }}
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
                        placeholder={t(
                          "home.monasteryDescriptionArPlaceholder",
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="monastery_image"
                  label={t("home.monasteryImage")}
                >
                  <Base64ImageUpload
                    buttonLabel={t("home.uploadMonasteryImage")}
                    emptyLabel={t("home.noImage")}
                    removeLabel={t("home.removeImage")}
                    errorLabel={t("home.imageProcessError")}
                  />
                </Form.Item>
              </Card>

              <Card
                size="small"
                title={t("home.areaSection")}
                style={{ marginBottom: 24 }}
              >
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

              <Card size="small" title={t("home.papaSection")}>
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
            </Col>

            <Col xs={24} lg={8}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <ImagePreview
                  src={watchedHeroImage}
                  label={t("home.heroImage")}
                  emptyLabel={t("home.noImage")}
                />
                <ImagePreview
                  src={watchedAboutImage}
                  label={t("home.aboutImage")}
                  emptyLabel={t("home.noImage")}
                />
                <ImagePreview
                  src={watchedStBishoyBioImage}
                  label={t("home.stBishoyBioImage")}
                  emptyLabel={t("home.noImage")}
                />
                <ImagePreview
                  src={watchedMonasteryImage}
                  label={t("home.monasteryImage")}
                  emptyLabel={t("home.noImage")}
                />
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
                loading={saving}
                size="large"
              >
                {t("common.save")}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
