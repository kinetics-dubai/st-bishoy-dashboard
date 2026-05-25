import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Spin,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { fetchEntity } from "@/store/entitiesSlice";
import {
  bulkAddGalleryItems,
  clearCurrentGallery,
  createGallery,
  deleteGallery,
  deleteGalleryItem,
  updateGalleryItem,
  updateGalleryTitles,
} from "@/store/galleriesSlice";
import Base64ImageUpload from "@/components/Base64ImageUpload";
import FormPageLayout from "@/components/FormPageLayout";
import FormSection from "@/components/FormSection";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { getDirtyValues } from "@/lib/formUtils";

const { Text } = Typography;

export default function EntityGalleryForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { currentEntity, loading: entityLoading } = useSelector((state) => state.entities);
  const { creating, updating, deleting, uploadingItems, updatingItem, deletingItem } =
    useSelector((state) => state.galleries);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editValues, setEditValues] = useState({ caption: "", caption_ar: "" });

  const saving = creating || updating || uploadingItems;

  useEffect(() => {
    dispatch(fetchEntity(id));
    return () => { dispatch(clearCurrentGallery()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentEntity) return;
    const gallery = currentEntity.gallery;
    form.setFieldsValue({
      title: gallery?.title || "",
      title_ar: gallery?.title_ar || "",
      newItems: [],
    });
  }, [currentEntity, form]);

  const handleSubmit = async (values) => {
    try {
      const gallery = currentEntity?.gallery;
      let galleryId = gallery?.id;

      if (!gallery) {
        const created = await dispatch(
          createGallery({
            record_id: Number(id),
            title: values.title || null,
            title_ar: values.title_ar || null,
          }),
        ).unwrap();
        galleryId = created?.id;
      } else {
        const initial = { title: gallery.title || "", title_ar: gallery.title_ar || "" };
        const current = { title: values.title || "", title_ar: values.title_ar || "" };
        const dirty = getDirtyValues(current, initial);
        if (Object.keys(dirty).length > 0) {
          await dispatch(updateGalleryTitles({ id: galleryId, ...dirty })).unwrap();
        }
      }

      const newItems = (values.newItems || []).filter((item) => item?.image);
      if (newItems.length > 0) {
        await dispatch(
          bulkAddGalleryItems({
            galleryId,
            items: newItems.map(({ image, caption, caption_ar }) => ({
              image,
              caption: caption || null,
              caption_ar: caption_ar || null,
            })),
          }),
        ).unwrap();
      }

      message.success(t("entities.gallery.saveSuccess"));
      navigate(`/entities/${id}`);
    } catch {
      message.error(t("entities.gallery.saveError"));
    }
  };

  const handleDeleteGallery = async () => {
    try {
      await dispatch(deleteGallery(currentEntity.gallery.id)).unwrap();
      message.success(t("entities.gallery.deleteSuccess"));
      navigate(`/entities/${id}`);
    } catch {
      message.error(t("entities.gallery.deleteError"));
    }
  };

  const handleStartEditItem = (item) => {
    setEditingItemId(item.id);
    setEditValues({ caption: item.caption || "", caption_ar: item.caption_ar || "" });
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
    setEditValues({ caption: "", caption_ar: "" });
  };

  const handleSaveItem = async (item) => {
    try {
      const initial = { caption: item.caption || "", caption_ar: item.caption_ar || "" };
      const dirty = getDirtyValues(editValues, initial);
      if (Object.keys(dirty).length > 0) {
        await dispatch(
          updateGalleryItem({
            galleryId: currentEntity.gallery.id,
            itemId: item.id,
            ...dirty,
          }),
        ).unwrap();
        message.success(t("entities.gallery.itemUpdateSuccess"));
        dispatch(fetchEntity(id));
      }
      setEditingItemId(null);
    } catch {
      message.error(t("entities.gallery.itemUpdateError"));
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await dispatch(
        deleteGalleryItem({ galleryId: currentEntity.gallery.id, itemId }),
      ).unwrap();
      message.success(t("entities.gallery.itemDeleteSuccess"));
      dispatch(fetchEntity(id));
    } catch {
      message.error(t("entities.gallery.itemDeleteError"));
    }
  };

  const isPageLoading = entityLoading && !currentEntity;

  if (isPageLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const gallery = currentEntity?.gallery;
  const existingItems = gallery?.items || [];
  const entityName = currentEntity?.name || "";

  return (
    <FormPageLayout
      title={t("entities.gallery.title")}
      subtitle={entityName}
      backPath={`/entities/${id}`}
      form={form}
      saving={saving}
      isEditMode={Boolean(gallery)}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ title: "", title_ar: "", newItems: [] }}
        scrollToFirstError
      >
        <FormSection icon={<PictureOutlined />} title={t("entities.gallerySection")}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="title" label={t("entities.galleryTitle")}>
                <Input placeholder={t("entities.galleryTitlePlaceholder")} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="title_ar" label={t("entities.galleryTitleAr")}>
                <Input dir="rtl" placeholder={t("entities.galleryTitleArPlaceholder")} size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* {gallery && (
            <Popconfirm
              title={t("entities.gallery.deleteConfirm")}
              onConfirm={handleDeleteGallery}
              okText={t("common.yes")}
              cancelText={t("common.no")}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} loading={deleting}>
                {t("entities.gallery.delete")}
              </Button>
            </Popconfirm>
          )} */}
        </FormSection>

        {existingItems.length > 0 && (
          <FormSection icon={<PictureOutlined />} title={t("entities.gallery.existingItems")}>
            <Row gutter={[16, 16]}>
              {existingItems.map((item, idx) => (
                <Col key={item.id ?? idx} xs={24} sm={12} md={8} lg={6}>
                  <div
                    style={{
                      border: "1px solid rgba(107,26,26,0.12)",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#fdf9f4",
                    }}
                  >
                    <Image
                      src={resolveMediaUrl(item.path || item.image)}
                      alt={item.caption || item.caption_ar || `Item ${idx + 1}`}
                      style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                      fallback=""
                    />

                    <div style={{ padding: "8px 10px" }}>
                      {editingItemId === item.id ? (
                        <>
                          <Input
                            value={editValues.caption}
                            onChange={(e) =>
                              setEditValues((prev) => ({ ...prev, caption: e.target.value }))
                            }
                            placeholder={t("entities.galleryItemCaptionPlaceholder")}
                            size="small"
                            style={{ marginBottom: 6 }}
                          />
                          <Input
                            dir="rtl"
                            value={editValues.caption_ar}
                            onChange={(e) =>
                              setEditValues((prev) => ({ ...prev, caption_ar: e.target.value }))
                            }
                            placeholder={t("entities.galleryItemCaptionArPlaceholder")}
                            size="small"
                            style={{ marginBottom: 8 }}
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button
                              type="primary"
                              size="small"
                              icon={<CheckOutlined />}
                              loading={updatingItem}
                              onClick={() => handleSaveItem(item)}
                            >
                              {t("common.save")}
                            </Button>
                            <Button
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={handleCancelEditItem}
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {item.caption && (
                            <Text style={{ display: "block", fontSize: 12 }}>{item.caption}</Text>
                          )}
                          {item.caption_ar && (
                            <Text dir="rtl" style={{ display: "block", fontSize: 12 }}>
                              {item.caption_ar}
                            </Text>
                          )}
                          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleStartEditItem(item)}
                            >
                              {t("common.edit")}
                            </Button>
                            <Popconfirm
                              title={t("entities.gallery.itemDeleteConfirm")}
                              onConfirm={() => handleDeleteItem(item.id)}
                              okText={t("common.yes")}
                              cancelText={t("common.no")}
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deletingItem}
                              >
                                {t("common.delete")}
                              </Button>
                            </Popconfirm>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </FormSection>
        )}

        <FormSection icon={<PlusOutlined />} title={t("entities.gallery.newItems")}>
          <Form.List name="newItems">
            {(fields, { add, remove }) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    style={{
                      border: "1px solid rgba(107,26,26,0.12)",
                      borderRadius: 12,
                      padding: 16,
                      background: "#fdf9f4",
                      position: "relative",
                    }}
                  >
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => remove(name)}
                      style={{ position: "absolute", top: 12, right: 12 }}
                    >
                      {t("entities.galleryRemoveImage")}
                    </Button>

                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item name={[name, "image"]} label={t("entities.galleryUploadImage")}>
                          <Base64ImageUpload
                            buttonLabel={t("entities.galleryUploadImage")}
                            emptyLabel={t("entities.noImage")}
                            removeLabel={t("entities.removeImage")}
                            errorLabel={t("entities.imageProcessError")}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name={[name, "caption"]}
                          label={t("entities.galleryItemCaption")}
                        >
                          <Input placeholder={t("entities.galleryItemCaptionPlaceholder")} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name={[name, "caption_ar"]}
                          label={t("entities.galleryItemCaptionAr")}
                        >
                          <Input dir="rtl" placeholder={t("entities.galleryItemCaptionArPlaceholder")} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ image: "", caption: "", caption_ar: "" })}
                  icon={<PlusOutlined />}
                  style={{ width: "100%" }}
                >
                  {t("entities.galleryAddImage")}
                </Button>
              </div>
            )}
          </Form.List>
        </FormSection>
      </Form>
    </FormPageLayout>
  );
}
