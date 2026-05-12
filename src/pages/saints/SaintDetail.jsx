import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Image,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  clearCurrentSaint,
  deleteSaint,
  fetchSaint,
} from "@/store/saintsSlice";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { getRankLabel } from "@/lib/ranks";

const { Title, Paragraph, Text } = Typography;

function DetailImage({ src, alt, emptyLabel }) {
  if (!src) {
    return <Text type="secondary">{emptyLabel}</Text>;
  }

  return (
    <Image
      src={resolveMediaUrl(src)}
      alt={alt}
      style={{
        width: "100%",
        maxWidth: 420,
        maxHeight: 280,
        objectFit: "cover",
        borderRadius: 12,
      }}
      fallback=""
    />
  );
}

export default function SaintDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { currentSaint, loading, deleting } = useSelector(
    (state) => state.saints,
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchSaint(id));
    }

    return () => {
      dispatch(clearCurrentSaint());
    };
  }, [dispatch, id]);

  const saintName =
    i18n.language === "ar" && currentSaint?.name_ar
      ? currentSaint.name_ar
      : currentSaint?.name;
  const saintRank = currentSaint?.rank
    ? getRankLabel(t, currentSaint.rank)
    : t("common.notAvailable");

  const handleDelete = () => {
    Modal.confirm({
      title: t("common.confirmDelete"),
      content: t("saints.deleteConfirm", {
        name: saintName || currentSaint?.name || t("common.notAvailable"),
      }),
      okText: t("common.delete"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk: async () => {
        try {
          await dispatch(deleteSaint(id)).unwrap();
          message.success(t("saints.deleteSuccess"));
          navigate("/saints");
        } catch (submitError) {
          message.error(
            submitError?.message ||
              submitError?.detail ||
              t("saints.deleteError"),
          );
        }
      },
    });
  };

  if (loading && !currentSaint) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentSaint) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Empty description={t("saints.notFound")} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <Space align="center" style={{ marginBottom: "16px" }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/saints")}
                >
                  {t("common.back")}
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  {saintName || currentSaint.name || t("saints.title")}
                </Title>
              </Space>

              <Space wrap size={[8, 8]} style={{ marginBottom: "16px" }}>
                <Tag color={currentSaint.departed ? "default" : "success"}>
                  {t("saints.departed")}:{" "}
                  {currentSaint.departed ? t("common.yes") : t("common.no")}
                </Tag>
                <Tag color={currentSaint.hasDetails ? "success" : "default"}>
                  {t("saints.hasDetails")}:{" "}
                  {currentSaint.hasDetails ? t("common.yes") : t("common.no")}
                </Tag>
              </Space>

              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t("saints.name")}>
                  {currentSaint.name || t("common.notAvailable")}
                </Descriptions.Item>
                <Descriptions.Item label={t("saints.nameAr")}>
                  {currentSaint.name_ar || t("common.notAvailable")}
                </Descriptions.Item>
                <Descriptions.Item label={t("saints.rank")}>
                  {saintRank}
                </Descriptions.Item>
                <Descriptions.Item label={t("saints.departed")}>
                  {currentSaint.departed ? t("common.yes") : t("common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("saints.description")}>
                  {currentSaint.description || t("common.notAvailable")}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div style={{ minWidth: 240 }}>
              <DetailImage
                src={currentSaint.image}
                alt={currentSaint.name}
                emptyLabel={t("saints.noImage")}
              />
            </div>
          </div>
        </Card>

        <Card title={t("saints.storyDetails")}>
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={t("saints.firstParagraph")}>
                <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                  {currentSaint.first_paragraph || t("common.notAvailable")}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label={t("saints.firstImage")}>
                <DetailImage
                  src={currentSaint.first_image}
                  alt={t("saints.firstImage")}
                  emptyLabel={t("saints.noImage")}
                />
              </Descriptions.Item>
              <Descriptions.Item label={t("saints.secondParagraph")}>
                <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                  {currentSaint.second_paragraph || t("common.notAvailable")}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label={t("saints.secondImage")}>
                <DetailImage
                  src={currentSaint.second_image}
                  alt={t("saints.secondImage")}
                  emptyLabel={t("saints.noImage")}
                />
              </Descriptions.Item>
            </Descriptions>

            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/saints/${id}/edit`)}
                style={{ background: "#6B1A1A" }}
              >
                {t("common.edit")}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
                onClick={handleDelete}
              >
                {t("common.delete")}
              </Button>
            </Space>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
