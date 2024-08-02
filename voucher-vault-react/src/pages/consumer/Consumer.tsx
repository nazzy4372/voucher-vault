import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Input,
  Button,
  Typography,
  ConfigProvider,
  Flex,
  Card,
  Badge,
  Drawer,
} from "antd";
import Header from "../../components/Header";
import { useNotificationContext } from "../../providers/NotificationProvider";
import { useNavigate } from "react-router-dom";
import {
  BrandDto,
  UserDto,
  useSessionContext,
} from "../../providers/ContextProvider";

import { ArrowRightOutlined } from "@ant-design/icons";
import { NftVoucherCollectionDto } from "../brands/Dashboard";
import { uint8_to_hexStr } from "../../utils";

export interface MintedNftVoucherDto {
  discount: number;
  id: Buffer;
  nft_voucher_collection: NftVoucherCollectionDto;
  owner: UserDto;
}

type NftCollectionItem = {
  brand: BrandDto;
  available: number;
};

const Consumer = () => {
  const [selectedBrand, setSelectedBrand] = useState<BrandDto | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [buttonLoading, setLoadingButton] = useState<[boolean, number]>([
    false,
    -1,
  ]);
  const [allNftCollections, setAllNftCollections] = useState<
    NftVoucherCollectionDto[]
  >([]);
  const [brandCollecions, setBrandCollecions] = useState<NftCollectionItem[]>(
    []
  );
  const [mintedNftCollections, setMintedNftCollections] = useState<
    MintedNftVoucherDto[]
  >([]);
  const notification = useNotificationContext();
  const { session } = useSessionContext();
  const navigate = useNavigate();

  const mintNftVoucher = async (
    collection: NftVoucherCollectionDto,
    i: number
  ) => {
    setLoadingButton([true, i]);

    if (!session) return;

    try {
      await session.call({
        name: "mint_nft_voucher",
        args: [collection.brand.account.id, collection.name],
      });
      notification.success({ message: "NFT Voucher successfully minted!" });
      await fetchUserCollections();
      setOpenDrawer(false);
      setSelectedBrand(null);
      await fetchAllCollections();
      setLoadingButton([false, i]);
    } catch (error) {
      setLoadingButton([false, i]);
      console.error(error);
      notification.error({ message: "Error minting NFT Voucher!" });
    }
  };

  const fetchAllCollections = useCallback(async () => {
    if (!session) return;

    try {
      // @ts-ignore
      const data = await session.query<NftVoucherCollectionDto[]>({
        name: "get_nft_voucher_collections",
      });
      setAllNftCollections(data);
      const nftCollectionsByBrand = data.reduce<{
        [brandName: string]: {
          brandData: BrandDto;
          available: number;
        };
      }>((acc, curr) => {
        const { brand, total_supply, minted_nft_count } = curr;
        const brandName = brand.name;
        const isAvailable = total_supply - minted_nft_count > 0;

        if (!acc[brandName])
          acc[brandName] = {
            brandData: brand,
            available: 0,
          };
        if (isAvailable) acc[brandName].available++;

        return acc;
      }, {});
      const brandCollections = Object.values(nftCollectionsByBrand).map(
        ({ brandData, available }) => ({
          brand: brandData,
          available,
        })
      );
      setBrandCollecions(brandCollections);
    } catch (error) {
      console.error(error);
      notification.error({ message: "Error fetching vouchers!" });
    }
  }, [session]);

  const fetchUserCollections = useCallback(async () => {
    if (!session) return;

    try {
      // @ts-ignore
      const data = await session.query<MintedNftVoucherDto[]>({
        name: "get_nft_vouchers_by_owner",
        args: {
          user_account_id: session.account.id,
        },
      });
      setMintedNftCollections(data);
    } catch (error) {
      console.error(error);
      notification.error({ message: "Error fetching minted vouchers!" });
    }
  }, [session]);

  const filteredBrandCollecions = useMemo(() => {
    if (!searchTerm) return brandCollecions;
    console.log({ brandCollecions });
    return [...brandCollecions].filter((val) =>
      val.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brandCollecions, searchTerm]);

  const selectedBrandCollections = useMemo(() => {
    if (!selectedBrand) return [];
    return allNftCollections.filter(
      (collection) => collection.brand.name === selectedBrand.name
    );
  }, [selectedBrand, allNftCollections]);

  useEffect(() => {
    fetchAllCollections();
  }, [fetchAllCollections]);

  useEffect(() => {
    fetchUserCollections();
  }, [fetchUserCollections]);

  return (
    <>
      <Header />
      <Flex
        style={{
          minHeight: "100vh",
          paddingTop: "64px",
          flexDirection: "column",
        }}
      >
        <ConfigProvider theme={{ token: { colorPrimary: "#EA9A00" } }}>
          <Flex justify="center" style={{ padding: "30px" }}>
            {" "}
            <Input.Search
              placeholder="Search Brands"
              size="large"
              style={{ width: "50%" }}
              onSearch={() => {}}
              onChange={(ev) => setSearchTerm(ev.target.value)}
              enterButton
            />
          </Flex>
          <Flex
            style={{
              width: "100%",
              padding: "0px 30px",
              alignItems: "flex-start",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {filteredBrandCollecions.map((brandCollecions, i) => (
              <Card style={{ margin: "10px", minWidth: "300px" }} key={i}>
                <Flex vertical={true} align="flex-start">
                  <Typography.Title level={2} style={{ margin: "10px 0px" }}>
                    {brandCollecions.brand.name}
                  </Typography.Title>
                  <Typography.Text>
                    You can mint {brandCollecions.available} NFT voucher
                    {brandCollecions.available > 1 ? "s" : ""}
                  </Typography.Text>
                  <Button
                    type="default"
                    style={{ width: "100%", marginTop: "20px" }}
                    onClick={() => {
                      setSelectedBrand(brandCollecions.brand);
                      setOpenDrawer(true);
                    }}
                  >
                    Mint Vouchers
                  </Button>
                </Flex>
              </Card>
            ))}
          </Flex>
          <Drawer
            size="large"
            title="Vouchers"
            placement="right"
            onClose={() => {
              setOpenDrawer(false);
              setSelectedBrand(null);
              setLoadingButton([false, -1]);
            }}
            open={openDrawer}
          >
            {selectedBrandCollections.map((val, i) => {
              const available = val.total_supply - val.minted_nft_count;
              const isAvailable = available > 0;
              const isMinted =
                mintedNftCollections
                  .filter(
                    (minted) =>
                      minted.nft_voucher_collection.brand.name ===
                      val.brand.name
                  )
                  .findIndex(
                    (minted) =>
                      minted.nft_voucher_collection.name === val.name &&
                      minted.nft_voucher_collection.brand.name ===
                        val.brand.name
                  ) !== -1;

              return (
                <div style={{ marginBottom: "20px" }} key={i}>
                  <Badge
                    count={`${
                      isMinted
                        ? "Claimed"
                        : isAvailable
                        ? "Available"
                        : "Sold out"
                    }`}
                    key={uint8_to_hexStr(val.brand.account.id)}
                    style={{
                      background: isAvailable || isMinted ? "#59B734" : "grey",
                    }}
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
                            Available For Mint: {available}{" "}
                          </Typography.Text>
                        </Flex>

                        <Typography.Title
                          level={3}
                          style={{ marginTop: "20px", color: "#EA9A00" }}
                          // copyable={{ text: "23345783939" }}
                        >
                          {val.name}
                        </Typography.Title>

                        <Typography.Text
                          style={{ textAlign: "left", opacity: "60%" }}
                        >
                          {val.desc}
                        </Typography.Text>
                      </Flex>
                      {!isMinted ? (
                        <Button
                          type="primary"
                          block
                          style={{ marginTop: "20px" }}
                          disabled={!isAvailable}
                          onClick={async () => {
                            if (isAvailable) await mintNftVoucher(val, i);
                          }}
                          loading={buttonLoading[1] === i && buttonLoading[0]}
                        >
                          {" "}
                          Mint Voucher
                          <ArrowRightOutlined />
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          block
                          style={{ marginTop: "20px", background: "#59B734" }}
                          onClick={() => navigate("/minted-nft-vouchers")}
                        >
                          {" "}
                          View Minted Voucher
                          <ArrowRightOutlined />
                        </Button>
                      )}
                    </Card>
                  </Badge>
                </div>
              );
            })}
          </Drawer>
        </ConfigProvider>
      </Flex>
    </>
  );
};

export default Consumer;
