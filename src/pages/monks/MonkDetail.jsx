import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card,
  Button,
  Space,
  Popconfirm,
  Empty,
  Descriptions,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { fetchMonk, deleteMonk } from "@/store/monksSlice";
import CenteredLoader from "@/components/CenteredLoader";
import { getRankLabel } from "@/lib/ranks";

const { Title, Paragraph } = Typography;

export default function MonkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentMonk, loading, error } = useSelector((state) => state.monks);

  useEffect(() => {
    if (id) {
      dispatch(fetchMonk(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteMonk(id)).unwrap();
      message.success(t("monk.monkDeleted"));
      navigate("/monks");
    } catch (error) {
      message.error(error?.message || error?.detail || t("common.error"));
    }
  };

  const displayName =
    i18n.language === "ar" && currentMonk?.name_ar
      ? currentMonk.name_ar
      : currentMonk?.name;
  const displayPosition =
    i18n.language === "ar" && currentMonk?.position_ar
      ? currentMonk.position_ar
      : currentMonk?.position;
  const displayRank = currentMonk?.rank
    ? getRankLabel(t, currentMonk.rank)
    : "";
  const subtitleParts = [displayRank, displayPosition].filter(Boolean);

  if (loading) {
    return <CenteredLoader minHeight="calc(100vh - 220px)" />;
  }

  if (!currentMonk) {
    return (
      <div className="p-6">
        <Empty description={error || t("common.notAvailable")} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto">
        <div className="flex items-center mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/monks")}
            className="mr-4"
          >
            {t("common.back")}
          </Button>
        </div>

        <Card>
          <div className="mb-6">
            <Title level={1} className="m-0 mb-2">
              {displayName || t("common.notAvailable")}
            </Title>
            <Paragraph type="secondary" className="m-0">
              {subtitleParts.join(" • ") || t("common.notAvailable")}
            </Paragraph>
          </div>

          <div className="mb-6">
            <Descriptions bordered column={1}>
              <Descriptions.Item label={t("monk.name")}>
                {currentMonk.name || t("common.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={t("monk.name_ar")}>
                {currentMonk.name_ar || t("common.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={t("monk.position")}>
                {currentMonk.position || t("common.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={t("monk.position_ar")}>
                {currentMonk.position_ar || t("common.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={t("monk.rank")}>
                {displayRank || t("common.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={t("monk.departed")}>
                {currentMonk.departed
                  ? t("monk.departedYes")
                  : t("monk.departedNo")}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Title level={4} className="mb-4">
                {t("monk.bio")}
              </Title>
              <Paragraph className="text-gray-700 leading-relaxed">
                {currentMonk.bio || t("monk.noBiography")}
              </Paragraph>
            </div>
            <div>
              <Title level={4} className="mb-4">
                {t("monk.bio_ar")}
              </Title>
              <Paragraph className="text-gray-700 leading-relaxed">
                {currentMonk.bio_ar || t("monk.noBiography")}
              </Paragraph>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4 border-t">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/monks/${id}/edit`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t("common.edit")}
            </Button>
            <Popconfirm
              title={t("common.confirmDelete")}
              description={t("monk.confirmDeleteMonk", { name: displayName })}
              onConfirm={handleDelete}
              okText={t("common.yes")}
              cancelText={t("common.no")}
            >
              <Button danger icon={<DeleteOutlined />}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          </div>
        </Card>
      </div>
    </div>
  );
}
