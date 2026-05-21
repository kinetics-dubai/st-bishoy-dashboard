import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  Empty,
  message,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ProjectOutlined } from "@ant-design/icons";
import { fetchProjects, deleteProject } from "@/store/projectsSlice";
import { PAGE_SIZE } from "@/lib/queryHelper";
import CenteredLoader from "@/components/CenteredLoader";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export default function ProjectsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { projects, loading, error, deleting } = useSelector(
    (state) => state.projects,
  );

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const getTitle = (record) =>
    i18n.language === "ar" && record.title_ar ? record.title_ar : record.title;

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProject(id)).unwrap();
      message.success(t("projects.deleteSuccess"));
    } catch (err) {
      message.error(err?.message || err?.detail || t("common.error"));
    }
  };

  const columns = [
    {
      title: t("projects.thumbnail"),
      key: "thumbnail",
      width: 80,
      align: "center",
      render: (_, record) =>
        record.thumbnail ? (
          <Avatar
            shape="square"
            size={48}
            src={resolveMediaUrl(record.thumbnail)}
            alt={getTitle(record)}
          />
        ) : (
          <Avatar shape="square" size={48} icon={<ProjectOutlined />} />
        ),
    },
    {
      title: t("projects.title"),
      key: "title",
      render: (_, record) => getTitle(record) || t("common.notAvailable"),
    },
    {
      title: t("projects.description"),
      key: "description",
      ellipsis: true,
      render: (_, record) => {
        const desc =
          i18n.language === "ar" && record.description_ar
            ? record.description_ar
            : record.description;
        return desc || t("common.notAvailable");
      },
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects/${record.id}/edit`)}
          />
          <Popconfirm
            title={t("common.confirmDelete")}
            description={t("projects.deleteConfirm", {
              title: getTitle(record),
            })}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.yes")}
            cancelText={t("common.no")}
            okButtonProps={{ loading: deleting }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => dispatch(fetchProjects())}>
              {t("common.retry")}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ProjectOutlined style={{ fontSize: 24, color: "#6B1A1A" }} />
              <span
                style={{ fontSize: "20px", fontWeight: 600, color: "#6B1A1A" }}
              >
                {t("navigation.projects")}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/projects/create")}
              style={{ background: "#6B1A1A" }}
            >
              {t("projects.create")}
            </Button>
          </div>
        }
      >
        {loading && !projects.length ? (
          <CenteredLoader minHeight={320} />
        ) : projects.length > 0 ? (
          <Table
            dataSource={projects}
            columns={columns}
            rowKey="id"
            loading={loading || deleting}
            pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false }}
          />
        ) : (
          <Empty
            description={t("common.empty")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/projects/create")}
              style={{ background: "#6B1A1A" }}
            >
              {t("projects.create")}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
