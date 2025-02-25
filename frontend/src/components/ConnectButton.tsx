import { useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";

export default function ConnectButton({
  onConnect,
}: {
  onConnect: (provider: ethers.BrowserProvider) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        setIsConnected(true);
        onConnect(provider);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      className="bg-acid-pink px-8 py-4 rounded-full font-bold
               border-2 border-ooze-blue text-dark-slime
               hover:shadow-neon transition-all duration-300"
      style={{
        textShadow: "0 0 10px #00ff9d",
        boxShadow: "0 0 30px #ff00ff",
      }}
    >
      {isConnected ? "CONNECTED" : "CONNECT MUTAGEN WALLET"}
    </motion.button>
  );
}
