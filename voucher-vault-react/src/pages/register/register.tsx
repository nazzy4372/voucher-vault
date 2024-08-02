import {
  Layout,
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  ConfigProvider,
  TabsProps,
} from "antd";
import React,{useState} from "react";
import { useNotificationContext } from "../../providers/NotificationProvider";
import Header from "../../components/Header";

const { Title } = Typography;
const { Content } = Layout;

interface RegisterBrandInputs {
  name: string;
}

const Register = () => {
  const notification = useNotificationContext();
  
  const tabItems: TabsProps["items"] = [
    {
      key: "consumer",
      label: "Customer",
      children: <ConsumerTabPane />,
    },
    {
      key: "brand",
      label: "Brand",
      children: <BrandTabPane />,
    },
  ];

  return (
    <>
      <Header />
      <Layout style={{ minHeight: "100vh" }}>
        <Title style={{ color: "#EA9A00" }}>Voucher Vault</Title>
        <ConfigProvider theme={{ token: { colorPrimary: "#EA9A00" } }}>
          <Content
            style={{
              marginTop: "70px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Tabs
              defaultActiveKey="1"
              style={{ width: "400px" }}
              items={tabItems}
              centered
            />
          </Content>
        </ConfigProvider>
      </Layout>
    </>
  );
};

const ConsumerTabPane = () => {
  const [loadingButton,setLoadingButton]=useState(false)
  const onLoginClick = () => {
    setLoadingButton(true)
    const event = new CustomEvent("auth_consumer", {
      detail: {},
    });

    window.dispatchEvent(event);
  };

  return (
    <Button
      type="primary"
      htmlType="button"
      onClick={onLoginClick}
      style={{
        width: "100%",
        backgroundColor: "#EA9A00",
        borderColor: "#EA9A00",
      }}
      loading={loadingButton}
    >
      Login / Signup
    </Button>
  );
};

const BrandTabPane = () => {
  const [loadingButton,setLoadingButton]=useState(false);
  const [form] = Form.useForm<RegisterBrandInputs>();

  const onFinish = (values: RegisterBrandInputs) => {
    setLoadingButton(true)
    const event = new CustomEvent("auth_brand", {
      detail: values,
    });

    window.dispatchEvent(event);
  };

  return (
    <Form
      name="brands_form"
      initialValues={{ name: "" }}
      layout="vertical"
      form={form}
      onFinish={onFinish}
    >
      <Form.Item
        label="Brand Name"
        name="name"
        rules={[{ required: true, message: "Please input your Brand Name" }]}
      >
        <Input />
      </Form.Item>

      {/* <Form.Item
    label="Password"
    name="password"
    rules={[{ required: true, message: 'Please input your password!' }]}
  >
    <Input.Password />
  </Form.Item> */}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{
            width: "100%",
            backgroundColor: "#EA9A00",
            borderColor: "#EA9A00",
          }}
          loading={loadingButton}
        >
          Login / Signup
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Register;
