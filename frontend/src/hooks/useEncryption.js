import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import {
  initializeEncryption,
  getPrivateKey,
  clearPrivateKey,
} from "../utils/encryption";
import useShowToast from "./useShowToast";

const useEncryption = () => {
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();

  useEffect(() => {
    const setupEncryption = async () => {
      if (!user) {
        return;
      }

      try {
        // Check if user already has keys
        const existingPrivateKey = getPrivateKey(user._id);
        if (existingPrivateKey) {
          return;
        }

        // Initialize encryption for new user
        const result = await initializeEncryption(user._id);
        
        if (result.success && result.publicKey) {
          // Upload public key to server
          const res = await fetch("/api/users/publickey", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicKey: result.publicKey,
            }),
          });

          const data = await res.json();
          if (data.error) {
            console.error("Failed to upload public key:", data.error);
          }
        }
      } catch (error) {
        console.error("Error setting up encryption:", error);
      }
    };

    setupEncryption();
  }, [user]);

  const cleanupKeys = () => {
    if (user) {
      clearPrivateKey(user._id);
    }
  };

  return { cleanupKeys };
};

export default useEncryption;
