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
  Tag,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import {
  fetchEvents,
  deleteEvent,
  setEventsPage,
} from "@/store/eventsSlice";
import { PAGE_SIZE } from "@/lib/queryHelper";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import CenteredLoader from "@/components/CenteredLoader";

export default function EventsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { events, loading, error, deleting, page, total } =
    useSelector((state) => state.events);

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
      dispatch(setEventsPage(1));
      return;
    }
    const params = { page, search: searchDebounce };
    if (publishedFilter !== undefined) params.published = publishedFilter;
    dispatch(fetchEvents(params));
  }, [dispatch, page, searchDebounce, publishedFilter]);

  const getTitle = (record) =>
    i18n.language === "ar" && record.title_ar ? record.title_ar : record.title;

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEvent(id)).unwrap();
      message.success(t("events.deleteSuccess"));
    } catch (err) {
      message.error(err?.message || err?.detail || t("common.error"));
    }
  };

  const columns = [
    {
      title: t("events.titleLabel"),
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
              <CalendarOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
          )}
          <span style={{ fontWeight: 500 }}>
            {getTitle(record) || t("common.notAvailable")}
          </span>
        </div>
      ),
    },
    {
      title: t("events.startAtLabel"),
      key: "start_at",
      width: 180,
      render: (_, record) =>
        record.start_at
          ? dayjs(record.start_at).format("YYYY-MM-DD HH:mm")
          : t("common.notAvailable"),
    },
    {
      title: t("events.isVirtualLabel"),
      key: "is_virtual",
      width: 110,
      render: (_, record) => (
        <Tag color={record.is_virtual ? "blue" : "default"}>
          {record.is_virtual ? t("common.yes") : t("common.no")}
        </Tag>
      ),
    },
    {
      title: t("events.publishedLabel"),
      key: "published",
      width: 140,
      render: (_, record) => (
        <Badge
          status={record.published ? "success" : "default"}
          text={
            record.published
              ? t("events.publishedStatus")
              : t("events.draftStatus")
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
            onClick={() => navigate(`/events/${record.slug}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${record.slug}/edit`)}
          />
          <Popconfirm
            title={t("common.confirmDelete")}
            description={t("events.deleteConfirmMessage", {
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
              onClick={() => dispatch(fetchEvents({ page }))}
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
              <CalendarOutlined style={{ fontSize: 24, color: "#6B1A1A" }} />
              <span
                style={{ fontSize: "20px", fontWeight: 600, color: "#6B1A1A" }}
              >
                {t("navigation.events")}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/events/create")}
              style={{ background: "#6B1A1A" }}
            >
              {t("events.create")}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: "16px", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Input
            placeholder={t("events.searchPlaceholder")}
            allowClear
            style={{ minWidth: 300, maxWidth: 400 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
          <Select
            allowClear
            placeholder={t("events.publishedLabel")}
            style={{ minWidth: 160 }}
            value={publishedFilter}
            onChange={(val) => {
              setPublishedFilter(val);
              dispatch(setEventsPage(1));
            }}
            options={[
              { label: t("events.publishedStatus"), value: true },
              { label: t("events.draftStatus"), value: false },
            ]}
          />
        </div>

        {loading && !events.length ? (
          <CenteredLoader minHeight={320} />
        ) : events.length > 0 ? (
          <Table
            dataSource={events}
            columns={columns}
            rowKey="id"
            loading={loading || deleting}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total,
              showSizeChanger: false,
              onChange: (nextPage) => dispatch(setEventsPage(nextPage)),
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
              onClick={() => navigate("/events/create")}
              style={{ background: "#6B1A1A" }}
            >
              {t("events.create")}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
