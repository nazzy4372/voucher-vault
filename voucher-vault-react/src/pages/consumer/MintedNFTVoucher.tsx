import { useCallback, useEffect, useState } from "react";
import { Flex, Typography, Card } from "antd";
import { useSessionContext } from "../../providers/ContextProvider";
import { useNotificationContext } from "../../providers/NotificationProvider";
import { MintedNftVoucherDto } from "./Consumer";
import Header from "../../components/Header";
import { uint8_to_hexStr } from "../../utils";

const MintedNFTVoucher = () => {
  const { session } = useSessionContext();
  const notification = useNotificationContext();
  const [nftVouchers, setNftVouchers] = useState<MintedNftVoucherDto[]>([]);

  const fetchNftVouchers = useCallback(async () => {
    if (!session) return;

    try {
      // @ts-ignore
      const nftVouchers = await session.query<MintedNftVoucherDto[]>({
        name: "get_nft_vouchers_by_owner",
        args: {
          user_account_id: session.account.id,
        },
      });
      setNftVouchers(nftVouchers);
    } catch (error) {
      console.error(error);
      notification.error({ message: "Error fetching NFT Vouchers!" });
    }
  }, [session]);

  useEffect(() => {
    fetchNftVouchers();
  }, [fetchNftVouchers]);

  return (
    <>
      <Header />
      <Flex
        style={{ minHeight: "100vh", padding: "60px 30px" }}
        vertical={true}
      >
        <Typography.Title level={1} style={{ padding: "0px 30px" }}>
          Minted NFT Vouchers
        </Typography.Title>
        <Flex
          style={{
            width: "100%",
            padding: "0px 30px",
            alignItems: "flex-start",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {nftVouchers.map((val, index) => {
            return (
              <Card style={{ width: "500px" }} key={index}>
                <Flex align="flex-start" vertical={true}>
                  <Flex justify="space-between" style={{ width: "100%" }}>
                    <Typography.Title level={2} style={{ margin: "0px" }}>
                      {val.discount}% OFF
                    </Typography.Title>
                    <Typography.Title level={5} style={{ margin: "0px" }}>
                      {val.nft_voucher_collection.brand.name}
                    </Typography.Title>
                  </Flex>
                  <Flex justify="space-between" style={{ width: "100%" }}>
                    <Typography.Title
                      level={4}
                      style={{ marginTop: "20px", color: "#EA9A00" }}
                    >
                      {val.nft_voucher_collection.name}
                    </Typography.Title>
                    <Typography.Title
                    level={4}
                    style={{ marginTop: "20px", color: "#EA9A00" }}
                    copyable={{ text: uint8_to_hexStr(val.id)}}
                  >
                    CODE: {uint8_to_hexStr(val.id).slice(0,10)+"..."}
                  </Typography.Title>
                  </Flex>

                  <Typography.Text
                    style={{ textAlign: "left", opacity: "60%" }}
                  >
                    {val.nft_voucher_collection.desc}
                  </Typography.Text>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default MintedNFTVoucher;
