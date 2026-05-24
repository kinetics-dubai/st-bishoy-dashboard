import { useEffect, useRef, useState } from "react";
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
  Input,
  Select,
  message,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Search } from "lucide-react";
import {
  fetchArticles,
  deleteArticle,
  setPage,
} from "@/store/articlesSlice";
import { PAGE_SIZE } from "@/lib/queryHelper";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import CenteredLoader from "@/components/CenteredLoader";

export default function ArticlesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { articles, loading, error, deleting, page, total } =
    useSelector((state) => state.articles);

  const [searchText, setSearchText] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [publishedFilter, setPublishedFilter] = useState(undefined);
  const previousSearchRef = useRef("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length >= 3) setSearchDebounce(searchText);
      else if (searchText.length === 0) setSearchDebounce("");
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const searchChanged = previousSearchRef.current !== searchDebounce;
    previousSearchRef.current = searchDebounce;
    if (searchChanged && page !== 1) {
      dispatch(setPage(1));
      return;
    }
    const params = { page, search: searchDebounce };
    if (publishedFilter !== undefined) params.published = publishedFilter;
    dispatch(fetchArticles(params));
  }, [dispatch, page, searchDebounce, publishedFilter]);

  const getTitle = (record) =>
    i18n.language === "ar" && record.title_ar ? record.title_ar : record.title;

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteArticle(id)).unwrap();
      message.success(t("articles.deleteSuccess"));
    } catch (err) {
      message.error(err?.message || err?.detail || t("common.error"));
    }
  };

  const columns = [
    {
      title: t("articles.titleLabel"),
      key: "title",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {record.thumbnail ? (
            <img
              src={resolveMediaUrl(record.thumbnail)}
              alt=""
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                flexShrink: 0,
                background: "linear-gradient(135deg, #6B1A1A 0%, #8B2A3A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
          )}
          <span style={{ fontWeight: 500 }}>
            {getTitle(record) || t("common.notAvailable")}
          </span>
        </div>
      ),
    },
    {
      title: t("articles.publishedLabel"),
      key: "published",
      width: 200,
      render: (_, record) => (
        <Badge
          status={record.published ? "success" : "default"}
          text={
            record.published
              ? t("articles.publishedStatus")
              : t("articles.draftStatus")
          }
        />
      ),
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
            onClick={() => navigate(`/articles/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/articles/${record.id}/edit`)}
          />
          <Popconfirm
            title={t("common.confirmDelete")}
            description={t("articles.deleteConfirmMessage", {
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
            <Button
              type="primary"
              onClick={() => dispatch(fetchArticles({ page }))}
            >
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
              <FileTextOutlined style={{ fontSize: 24, color: "#6B1A1A" }} />
              <span
                style={{ fontSize: "20px", fontWeight: 600, color: "#6B1A1A" }}
              >
                {t("navigation.articles")}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/articles/create")}
              style={{ background: "#6B1A1A" }}
            >
              {t("articles.create")}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: "16px", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Input
            placeholder={t("articles.searchPlaceholder")}
            allowClear
            style={{ minWidth: 300, maxWidth: 400 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
          <Select
            allowClear
            placeholder={t("articles.publishedLabel")}
            style={{ minWidth: 160 }}
            value={publishedFilter}
            onChange={(val) => {
              setPublishedFilter(val);
              dispatch(setPage(1));
            }}
            options={[
              { label: t("articles.publishedStatus"), value: true },
              { label: t("articles.draftStatus"), value: false },
            ]}
          />
        </div>

        {loading && !articles.length ? (
          <CenteredLoader minHeight={320} />
        ) : articles.length > 0 ? (
          <Table
            dataSource={articles}
            columns={columns}
            rowKey="id"
            loading={loading || deleting}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total,
              showSizeChanger: false,
              onChange: (nextPage) => dispatch(setPage(nextPage)),
            }}
          />
        ) : (
          <Empty
            description={t("common.empty")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/articles/create")}
              style={{ background: "#6B1A1A" }}
            >
              {t("articles.create")}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
