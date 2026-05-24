import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  message,
  Modal,
  Divider,
} from "antd";
import {
  ShoppingOutlined,
  FileTextOutlined,
  PictureOutlined,
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  clearCurrentProduct,
} from "@/store/productsSlice";
import Base64ImageUpload from "@/components/Base64ImageUpload";
import FormPageLayout from "@/components/FormPageLayout";
import FormSection from "@/components/FormSection";
import apiService from "@/services/apiService";
import { getApiErrorMessage } from "@/lib/apiError";
import { getDirtyValues } from "@/lib/formUtils";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const { TextArea } = Input;

export default function ProductForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const { currentProduct, loading, creating, updating } = useSelector(
    (state) => state.products,
  );

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const isEditMode = !!slug && !window.location.pathname.includes("/create");
  const watchedImage = Form.useWatch("image", form);
  const watchedCategoryImage = Form.useWatch("file_base64", categoryForm);

  const isValidBase64ImageDataUri = (value) => {
    if (!value) return true; // optional
    if (typeof value !== "string") return false;
    const allowedPrefixes = [
      "data:image/jpeg;base64,",
      "data:image/png;base64,",
      "data:image/webp;base64,",
    ];
    const prefix = allowedPrefixes.find((p) => value.startsWith(p));
    if (!prefix) return false;
    const base64Part = value.slice(prefix.length);
    return /^[A-Za-z0-9+/]+={0,2}$/.test(base64Part);
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await apiService.get("/categories");
      const raw = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      const flat = [];
      raw.forEach((cat) => {
        flat.push(cat);
        if (cat.children?.length)
          cat.children.forEach((child) => flat.push(child));
      });
      setCategories(flat);
    } catch (err) {
      message.error(getApiErrorMessage(err, t("common.error")));
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && slug) {
      dispatch(fetchProduct(slug));
    } else {
      dispatch(clearCurrentProduct());
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [slug, isEditMode, dispatch]);

  useEffect(() => {
    if (currentProduct && isEditMode) {
      form.setFieldsValue({
        title: currentProduct.title || "",
        title_ar: currentProduct.title_ar || "",
        description: currentProduct.description || "",
        description_ar: currentProduct.description_ar || "",
        image: currentProduct.image || "",
        categoryId: currentProduct.categoryId || undefined,
      });
    }
  }, [currentProduct, form, isEditMode]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title?.trim(),
        title_ar: values.title_ar?.trim(),
        description: values.description?.trim() || "",
        description_ar: values.description_ar?.trim() || "",
        categoryId: values.categoryId,
        image: values.image || "",
      };

      if (isEditMode) {
        const initial = {
          title: currentProduct.title?.trim() || "",
          title_ar: currentProduct.title_ar?.trim() || "",
          description: currentProduct.description?.trim() || "",
          description_ar: currentProduct.description_ar?.trim() || "",
          categoryId: currentProduct.categoryId || undefined,
          image: currentProduct.image || "",
        };
        const payload = getDirtyValues(data, initial);
        if (Object.keys(payload).length === 0) {
          message.success(t("products.updateSuccess"));
          navigate("/products");
          return;
        }
        await dispatch(
          updateProduct({ id: currentProduct.id, data: payload }),
        ).unwrap();
        message.success(t("products.updateSuccess"));
        navigate("/products");
      } else {
        const createData = { ...data };
        if (!createData.image) delete createData.image;
        const response = await dispatch(createProduct(createData)).unwrap();
        message.success(t("products.createSuccess"));
        navigate(`/products/${response.slug}`);
      }
    } catch (error) {
      message.error(error?.message || error?.detail || t("common.error"));
    }
  };

  const handleCreateCategory = async (values) => {
    setCreatingCategory(true);
    try {
      if (!isValidBase64ImageDataUri(values.file_base64)) {
        throw new Error(t("products.categoryImageInvalid"));
      }

      const response = await apiService.post("/categories", {
        name: values.name?.trim(),
        name_ar: values.name_ar?.trim(),
        ...(values.file_base64 ? { file_base64: values.file_base64 } : {}),
        ...(values.parentId ? { parentId: values.parentId } : {}),
      });
      const newCat = response.data?.data || response.data;
      message.success(t("products.categoryCreated"));
      setCategoryModalOpen(false);
      categoryForm.resetFields();
      await loadCategories();
      form.setFieldValue("categoryId", newCat.id);
    } catch (err) {
      message.error(err?.message || t("common.error"));
    } finally {
      setCreatingCategory(false);
    }
  };

  const getCategoryLabel = (cat) =>
    i18n.language === "ar" && cat.name_ar ? cat.name_ar : cat.name;

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.parentId ? `— ${getCategoryLabel(cat)}` : getCategoryLabel(cat),
  }));

  return (
    <FormPageLayout
      title={isEditMode ? t("products.edit") : t("products.create")}
      subtitle={t("navigation.products")}
      backPath="/products"
      form={form}
      saving={creating || updating}
      isEditMode={isEditMode}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <FormSection
          icon={<ShoppingOutlined />}
          title={t("navigation.products")}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("products.title")}
                name="title"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input
                  size="large"
                  placeholder={t("products.titlePlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("products.title_ar")}
                name="title_ar"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input
                  size="large"
                  dir="rtl"
                  placeholder={t("products.titleArPlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("products.category")}
                name="categoryId"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Select
                  size="large"
                  placeholder={t("products.selectCategory")}
                  loading={categoriesLoading}
                  options={categoryOptions}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        style={{ width: "100%", textAlign: "left" }}
                        onClick={() => setCategoryModalOpen(true)}
                      >
                        {t("products.createCategory")}
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <FormSection
          icon={<FileTextOutlined />}
          title={t("products.description")}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("products.description")}
                name="description"
                rules={[
                  { required: true, message: t("validation.required") },
                  {
                    validator: (_, value) =>
                      String(value ?? "").trim().length
                        ? Promise.resolve()
                        : Promise.reject(new Error(t("validation.required"))),
                  },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder={t("products.descriptionPlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("products.description_ar")}
                name="description_ar"
                rules={[
                  { required: true, message: t("validation.required") },
                  {
                    validator: (_, value) =>
                      String(value ?? "").trim().length
                        ? Promise.resolve()
                        : Promise.reject(new Error(t("validation.required"))),
                  },
                ]}
              >
                <TextArea
                  rows={5}
                  dir="rtl"
                  placeholder={t("products.descriptionArPlaceholder")}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <FormSection icon={<PictureOutlined />} title={t("products.image")}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="image"
                rules={[
                  { required: true, message: t("validation.required") },
                  {
                    validator: (_, value) =>
                      typeof value === "string" && value.trim().length
                        ? Promise.resolve()
                        : Promise.reject(new Error(t("validation.required"))),
                  },
                ]}
              >
                <Base64ImageUpload
                  buttonLabel={t("products.uploadImage")}
                  emptyLabel={t("products.noImage")}
                  removeLabel={t("common.delete")}
                  errorLabel={t("products.imageProcessError")}
                />
              </Form.Item>
            </Col>
            {watchedImage && (
              <Col xs={24} md={12}>
                <img
                  src={resolveMediaUrl(watchedImage)}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Col>
            )}
          </Row>
        </FormSection>
      </Form>

      <Modal
        title={t("products.createCategory")}
        open={categoryModalOpen}
        onCancel={() => {
          setCategoryModalOpen(false);
          categoryForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCreateCategory}
        >
          <Form.Item
            label={t("products.categoryName")}
            name="name"
            rules={[{ required: true, message: t("validation.required") }]}
          >
            <Input placeholder={t("products.categoryNamePlaceholder")} />
          </Form.Item>
          <Form.Item
            label={t("products.categoryNameAr")}
            name="name_ar"
            rules={[{ required: true, message: t("validation.required") }]}
          >
            <Input
              dir="rtl"
              placeholder={t("products.categoryNameArPlaceholder")}
            />
          </Form.Item>
          {/* <Form.Item
            label={t("products.categoryImage")}
            name="file_base64"
            rules={[
              {
                validator: (_, value) =>
                  isValidBase64ImageDataUri(value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(t("products.categoryImageInvalid")),
                      ),
              },
            ]}
          >
            <Base64ImageUpload
              buttonLabel={t("products.uploadImage")}
              emptyLabel={t("products.noImage")}
              removeLabel={t("common.delete")}
              errorLabel={t("products.imageProcessError")}
              accept="image/jpeg,image/png,image/webp"
            />
          </Form.Item> */}
          {/* {watchedCategoryImage && (
            <img
              src={watchedCategoryImage}
              alt="category-preview"
              style={{
                width: "100%",
                maxHeight: 180,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
          )} */}
          {/* <Form.Item label={t('products.categoryParent')} name="parentId">
            <Select placeholder={t('products.selectParentCategory')} allowClear options={categoryOptions} />
          </Form.Item> */}
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              onClick={() => {
                setCategoryModalOpen(false);
                categoryForm.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creatingCategory}
              style={{ background: "#6B1A1A" }}
            >
              {t("common.create")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </FormPageLayout>
  );
}
