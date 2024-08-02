import {
  Account,
  Session,
  createKeyStoreInteractor,
  createSingleSigAuthDescriptorRegistration,
  createWeb3ProviderEvmKeyStore,
  hours,
  registerAccount,
  registrationStrategy,
  ttlLoginRule,
} from "@chromia/ft4";
import { createClient, IClient } from "postchain-client";
import { useNotificationContext } from "./NotificationProvider";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { checkForDevMode } from "../utils";
import { chromiaClientConfig, getChromiaClientDevConfig } from "../config";

export interface BrandDto {
  account: Account;
  name: string;
}

export interface UserDto {
  account: Account;
}

interface GlobalContext {
  session: Session | undefined;
  brand: BrandDto | undefined;
  user: UserDto | undefined;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

// Create context for Chromia session
const ChromiaContext = createContext<GlobalContext>({
  session: undefined,
  brand: undefined,
  user: undefined,
});

export function ContextProvider({ children }: { children: ReactNode }) {
  const [globalState, setGlobalState] = useState<GlobalContext>({
    session: undefined,
    brand: undefined,
    user: undefined,
  });
  const clientRef = useRef<IClient | null>(null);
  const notification = useNotificationContext();
  const navigate = useNavigate();
  const lastSuccessfullAuth = useRef<"brand" | "user">();

  const initClient = useCallback(async () => {
    if (clientRef.current) return;
    try {
      const isDevMode = checkForDevMode();

      const client = await createClient(
        isDevMode ? await getChromiaClientDevConfig() : chromiaClientConfig
      );
      clientRef.current = client;
    } catch (error) {
      console.error(error);
    }
  }, []);

  const initBrandSession = useCallback(async (ev: Event) => {
    try {
      const client = clientRef.current;
      if (!client || !window.ethereum) return;

      // 2. Connect with MetaMask
      const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);

      // 3. Get all accounts associated with evm address
      const evmKeyStoreInteractor = createKeyStoreInteractor(
        client,
        evmKeyStore
      );
      const accounts = await evmKeyStoreInteractor.getAccounts();
      const isDevMode = checkForDevMode();
      const qs = isDevMode ? "/?mode=dev" : "";

      if (accounts.length > 0) {
        try {
          // 4. Start a new session
          const { session } = await evmKeyStoreInteractor.login({
            accountId: accounts[0].id,
            config: {
              rules: ttlLoginRule(hours(2)),
              flags: ["MySession"],
            },
          });
          try {
            const user = await session.query({
              name: "get_user",
              args: {
                user_account_id: session.account.id,
              },
            });
            if (user) {
              notification.error({
                message: "This account is already registered as a user!",
                description: "Please use another account to continue as brand",
                onClose() {
                  window.location.reload();
                },
              });
              return;
            }
          } catch (error) {
            console.error(error);
          }
          setGlobalState((prev) => ({ ...prev, session }));
          notification.success({
            message: "You've been logged in successfully!",
          });
          lastSuccessfullAuth.current = "brand";
          navigate(`/dashboard${qs}`);
        } catch (error) {
          console.error(error);
          notification.error({
            message: "Error logging in! Please try again.",
          });
        }
      } else {
        const name = (ev as CustomEvent).detail?.name as string;
        if (!name) {
          return notification.error({
            message: "Name not found!",
            description: "Brand name is required for registration",
          });
        }

        // 5. Create a new account by signing a message using metamask
        const authDescriptor = createSingleSigAuthDescriptorRegistration(
          ["A", "T"],
          evmKeyStore.id
        );

        try {
          const { session } = await registerAccount(
            client,
            evmKeyStore,
            registrationStrategy.open(authDescriptor, {
              config: {
                rules: ttlLoginRule(hours(2)),
                flags: ["MySession"],
              },
            }),
            {
              name: "register_as_brand",
              args: [name],
            }
          );
          setGlobalState((prev) => ({ ...prev, session }));
          notification.success({ message: "You've registered successfully." });
          lastSuccessfullAuth.current = "brand";
          navigate(`/dashboard${qs}`);
        } catch (error: any) {
          console.error(error);
          notification.error({
            message: "Error registering your account! Please try again.",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const initUserSession = useCallback(async (ev: Event) => {
    try {
      const client = clientRef.current;
      if (!client || !window.ethereum) return;

      // 2. Connect with MetaMask
      const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);

      // 3. Get all accounts associated with evm address
      const evmKeyStoreInteractor = createKeyStoreInteractor(
        client,
        evmKeyStore
      );
      const accounts = await evmKeyStoreInteractor.getAccounts();
      const isDevMode = checkForDevMode();
      const qs = isDevMode ? "/?mode=dev" : "";

      if (accounts.length > 0) {
        try {
          // 4. Start a new session
          const { session } = await evmKeyStoreInteractor.login({
            accountId: accounts[0].id,
            config: {
              rules: ttlLoginRule(hours(2)),
              flags: ["MySession"],
            },
          });
          try {
            const brand = await session.query({
              name: "get_brand",
              args: {
                brand_account_id: session.account.id,
              },
            });
            if (brand) {
              notification.error({
                message: "This account is already registered as a brand!",
                description: "Please use another account to continue as user",
                onClose() {
                  window.location.reload();
                },
              });
              return;
            }
          } catch (error) {
            console.error(error);
          }
          setGlobalState((prev) => ({ ...prev, session }));
          notification.success({
            message: "You've been logged in successfully!",
          });
          lastSuccessfullAuth.current = "user";
          navigate(`/customer${qs}`);
        } catch (error) {
          console.error(error);
          notification.error({
            message: "Error logging in! Please try again.",
          });
        }
      } else {
        // 5. Create a new account by signing a message using metamask
        const authDescriptor = createSingleSigAuthDescriptorRegistration(
          ["A", "T"],
          evmKeyStore.id
        );

        try {
          const { session } = await registerAccount(
            client,
            evmKeyStore,
            registrationStrategy.open(authDescriptor, {
              config: {
                rules: ttlLoginRule(hours(2)),
                flags: ["MySession"],
              },
            }),
            {
              name: "register_as_user",
              args: [],
            }
          );
          setGlobalState((prev) => ({ ...prev, session }));
          notification.success({ message: "You've registered successfully." });
          lastSuccessfullAuth.current = "user";
          navigate(`/customer${qs}`);
        } catch (error: any) {
          console.error(error);
          notification.error({
            message: "Error registering your account! Please try again.",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchBrandAccount = useCallback(async () => {
    try {
      const session = globalState.session;
      if (!session || lastSuccessfullAuth.current !== "brand") return;

      // @ts-ignore
      const brand = await session.query<BrandDto>({
        name: "get_brand",
        args: {
          brand_account_id: session.account.id,
        },
      });
      setGlobalState((prev) => ({ ...prev, brand }));
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error fetching account details! Please try again.",
      });
    }
  }, [globalState.session]);

  const fetchUserAccount = useCallback(async () => {
    try {
      const session = globalState.session;
      if (!session || lastSuccessfullAuth.current !== "user") return;

      // @ts-ignore
      const user = await session.query<BrandDto>({
        name: "get_user",
        args: {
          user_account_id: session.account.id,
        },
      });
      setGlobalState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error fetching account details! Please try again.",
      });
    }
  }, [globalState.session]);

  useEffect(() => {
    initClient();
  }, [initClient]);

  useEffect(() => {
    window.addEventListener("auth_brand", initBrandSession, false);

    return () => {
      window.removeEventListener("auth_brand", initBrandSession, false);
    };
  }, [initBrandSession]);

  useEffect(() => {
    window.addEventListener("auth_consumer", initUserSession, false);

    return () => {
      window.removeEventListener("auth_consumer", initUserSession, false);
    };
  }, [initUserSession]);

  useEffect(() => {
    fetchBrandAccount();

    window.addEventListener("refetch_brand_account", fetchBrandAccount, false);

    return () => {
      window.removeEventListener(
        "refetch_brand_account",
        fetchBrandAccount,
        false
      );
    };
  }, [fetchBrandAccount]);

  useEffect(() => {
    fetchUserAccount();

    window.addEventListener("refetch_user_account", fetchUserAccount, false);

    return () => {
      window.removeEventListener(
        "refetch_user_account",
        fetchUserAccount,
        false
      );
    };
  }, [fetchUserAccount]);

  return (
    <ChromiaContext.Provider value={globalState}>
      {children}
    </ChromiaContext.Provider>
  );
}

// Define hooks for accessing context
export function useSessionContext() {
  return useContext(ChromiaContext);
}
