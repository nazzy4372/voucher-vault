import { useCallback, useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  ConfigProvider,
  Flex,
  Card,
  Divider,
  Badge,
  InputNumber,
} from "antd";
import { useNotificationContext } from "../../providers/NotificationProvider";
import { BrandDto, useSessionContext } from "../../providers/ContextProvider";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import "./component/style.css";

type CreateNftCollectionInput = {
  name: string;
  desc: string;
  max_discount: number;
  total_supply: number;
};

export interface NftVoucherCollectionDto {
  brand: BrandDto;
  desc: string;
  max_discount: number;
  minted_nft_count: number;
  name: string;
  total_supply: number;
}

const Dashboard = () => {
  const [nftVoucherCollections, setNftVoucherCollections] = useState<
    NftVoucherCollectionDto[]
  >([]);
  const [isNftCollectionsLoading, setIsNftCollectionsLoading] = useState(true);
  const [form] = Form.useForm<CreateNftCollectionInput>();
  const notification = useNotificationContext();
  const [loadingButton, setLoadingButton] = useState(false);
  const { session } = useSessionContext();

  const fetchNftVoucherCollections = useCallback(async () => {
    if (!session) return;

    try {
      setIsNftCollectionsLoading(true);
      // @ts-ignore
      const collections = await session.query<NftVoucherCollectionDto[]>({
        name: "get_nft_voucher_collections_by_brand",
        args: {
          brand_account_id: session.account.id,
        },
      });
      setNftVoucherCollections(collections);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error fetching NFT Voucher Collections!",
      });
    } finally {
      setIsNftCollectionsLoading(false);
    }
  }, [session]);

  const onSubmit = async (values: CreateNftCollectionInput) => {
    if (!session) return;
    setLoadingButton(true);

    try {
      const { name, desc, total_supply, max_discount } = values;
      await session.call({
        name: "create_nft_voucher_collection",
        args: [name, desc, max_discount, total_supply],
      });
      notification.success({
        message: "NFT Voucher Collection added successfully!",
      });
      form.resetFields();
      fetchNftVoucherCollections();
      setLoadingButton(false);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message as string;
      if (
        errorMessage &&
        errorMessage.includes("duplicate key value violates unique constraint")
      ) {
        notification.error({
          message: "Collection with same name already exists!",
        });
      } else {
        notification.error({ message: "Error adding NFT Voucher Collection!" });
      }
      setLoadingButton(false);
    }
  };

  useEffect(() => {
    fetchNftVoucherCollections();
  }, [fetchNftVoucherCollections]);

  return (
    <>
      <Header />
      <Flex
        style={{
          minHeight: "100vh",
          justifyContent: "flex-end",
          paddingTop: "64px",
        }}
      >
        <ConfigProvider theme={{ token: { colorPrimary: "#EA9A00" } }}>
          <Flex
            style={{
              padding: "30px",
              width: "30%",
              flexDirection: "column",
              alignItems: "flex-start",
              position: "fixed",
              left: "0px",
            }}
          >
            <Typography.Title level={3} style={{ margin: "0px" }}>
              Create NFT Voucher Collection
            </Typography.Title>
            <Divider />
            <Form
              style={{ width: "100%" }}
              name="Create NFT Voucher Collection"
              initialValues={{ remember: true }}
              layout="vertical"
              onFinish={onSubmit}
              form={form}
            >
              <Form.Item
                className="margin-bottom-10"
                label="Collection Name"
                name="name"
                rules={[{ required: true, message: "Input collection name!" }]}
              >
                <Input />
              </Form.Item>
              <Flex justify="space-between">
                <Form.Item
                  className="margin-bottom-10"
                  label="Max Discount %"
                  name="max_discount"
                  rules={[
                    {
                      required: true,
                      message: "Input max discount percentage",
                    },
                  ]}
                  style={{ width: "45%" }}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  className="margin-bottom-10"
                  label="Total Supply"
                  name="total_supply"
                  rules={[
                    {
                      required: true,
                      message: "Enter the number of voucher you want to issue!",
                    },
                  ]}
                  style={{ width: "45%" }}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Flex>
              <Form.Item
                className="margin-bottom-10"
                label="Collection Description"
                name="desc"
                rules={[
                  {
                    required: true,
                    message: "Input collection description!",
                  },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item>
                <Button
                  loading={loadingButton}
                  type="primary"
                  htmlType="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#EA9A00",
                    borderColor: "#EA9A00",
                  }}
                >
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Flex>
          <Flex
            style={{
              width: "70%",
              padding: "30px",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography.Title level={3} style={{ margin: "0px" }}>
              NFT Voucher Collections
            </Typography.Title>
            <Divider />
            {/* NFT Collections Loading */}
            {isNftCollectionsLoading && <Loader />}

            {/* NFT Collecions Empty */}
            {!isNftCollectionsLoading && nftVoucherCollections.length === 0 && (
              <Typography.Text>
                Issued NFT Voucher Collections appear here.
              </Typography.Text>
            )}

            {/* NFT Collections List */}
            {!isNftCollectionsLoading &&
              nftVoucherCollections.length > 0 &&
              nftVoucherCollections.map((val, index) => {
                const remaining = val.total_supply - val.minted_nft_count;

                return (
                  <Badge
                    count={remaining ? "Available" : "Sold Out"}
                    key={index}
                    style={{ background: remaining ? "green" : "grey" }}
                  >
                    <Card style={{ width: "550px", marginBottom: "20px" }}>
                      <Flex align="flex-start" vertical={true}>
                        <Typography.Text>Upto</Typography.Text>
                        <Typography.Title
                          level={2}
                          style={{ margin: "0px 0px 10px 0px" }}
                        >
                          {val.max_discount}% OFF
                        </Typography.Title>
                        <Flex justify="space-between" style={{ width: "100%" }}>
                          <Typography.Text>
                            Total Supply: {val.total_supply}
                          </Typography.Text>
                          <Typography.Text>
                            {" "}
                            Available For Mint :{remaining}{" "}
                          </Typography.Text>
                        </Flex>

                        <Typography.Title
                          level={3}
                          style={{ marginTop: "20px", color: "#EA9A00" }}
                        >
                          {val.name}
                        </Typography.Title>

                        <Typography.Text
                          style={{ textAlign: "left", opacity: "60%" }}
                        >
                          {val.desc}
                        </Typography.Text>
                      </Flex>
                    </Card>
                  </Badge>
                );
              })}
          </Flex>
        </ConfigProvider>
      </Flex>
    </>
  );
};

export default Dashboard;
