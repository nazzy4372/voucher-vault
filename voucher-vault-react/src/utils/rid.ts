export const getBlockchainRid = async () => {
  try {
    const req = await fetch("http://localhost:7740/brid/iid_0");
    const rid = await req.text();
    return rid;
  } catch (error) {
    console.error(error);
    return "0";
  }
};
