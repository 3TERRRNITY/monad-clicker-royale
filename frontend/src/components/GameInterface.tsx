import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import ClickerABI from "../../abi/Clicker.json";
import { FaHandPointer } from "react-icons/fa";

const CONTRACT_ADDRESS = "0xB8Cc9E113D25498Cb2eB281cc8474D63189924Cc";
const MONAD_CHAIN_ID = BigInt(10143);

interface PlayerData {
  totalClicks: ethers.BigNumberish;
  nftCount: ethers.BigNumberish;
}

export default function GameInterface({
  provider,
}: {
  provider: ethers.BrowserProvider;
}) {
  const [clicks, setClicks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [nfts, setNfts] = useState<{ id: number; type: string }[]>([]);
  const [contract, setContract] = useState<ethers.Contract>();
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>(
    []
  );

  // Анимации
  const sparkVariants = {
    initial: { opacity: 1, scale: 0 },
    animate: { opacity: 0, scale: 2, x: [-50, 50], y: [-50, 50] },
  };

  const nftNotificationVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  // Инициализация контракта
  const initContract = useCallback(async () => {
    try {
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      if (network.chainId !== MONAD_CHAIN_ID) {
        await window.ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${MONAD_CHAIN_ID.toString(16)}` }],
        });
        return;
      }

      const clickerContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ClickerABI.abi,
        signer
      );

      setContract(clickerContract);

      // Подписка на события NFT
      clickerContract.on(
        "NFTMinted",
        (user: string, id: ethers.BigNumber, rarity: string) => {
          setNfts((prev) => [...prev, { id: id.toNumber(), type: rarity }]);
        }
      );

      // Загрузка начального состояния
      const address = await signer.getAddress();
      const player = (await clickerContract.players(address)) as PlayerData;
      setTotalClicks(player.totalClicks.toNumber());
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }, [provider]);

  useEffect(() => {
    if (!provider) return;

    const cleanup = async () => {
      await initContract();
      return () => contract?.removeAllListeners();
    };

    cleanup();
  }, [provider, initContract, contract]);

  // Обработка кликов
  const handleClick = async (e: React.MouseEvent) => {
    if (!contract) return;

    // Генерация искр
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSparks((prev) => [...prev.slice(-5), { id: Date.now(), x, y }]);

    setClicks((prev) => {
      const newCount = prev + 1;

      // Отправка транзакции каждые 100 кликов
      if (newCount % 100 === 0) {
        contract
          .claimClicks(100)
          .then(() => {
            setTotalClicks((prev) => prev + 100);
            setClicks(0);
          })
          .catch(console.error);
      }

      return newCount;
    });
  };

  return (
    <div className="min-h-screen bg-dark-slime text-acid-pink p-4 md:p-8 relative overflow-hidden">
      {/* Искры */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="absolute w-2 h-2 bg-acid-pink rounded-full pointer-events-none"
            style={{ left: spark.x, top: spark.y }}
            variants={sparkVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          />
        ))}
      </AnimatePresence>

      {/* Основной интерфейс */}
      <div className="relative max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 neon-text">
          MUTAGEN CLICKER
          <div className="text-sm md:text-base mt-2 text-ooze-blue">
            TOTAL CLICKS: {totalClicks + clicks}
          </div>
        </h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-64 h-64 bg-dark-slime/50 border-4 border-acid-pink rounded-full
                   flex items-center justify-center cursor-pointer backdrop-blur-lg
                   animate-neon-pulse mx-auto"
          onClick={handleClick}
          style={{ boxShadow: "0 0 40px #ff00ff80" }}
        >
          <FaHandPointer className="text-6xl md:text-8xl" />
          <div className="absolute bottom-8 text-2xl md:text-3xl font-mono">
            {clicks}
          </div>
        </motion.button>

        {/* Уведомления о NFT */}
        <div className="fixed bottom-4 right-4 space-y-2">
          <AnimatePresence>
            {nfts.slice(-3).map((nft, index) => (
              <motion.div
                key={`${nft.id}-${index}`}
                variants={nftNotificationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`p-4 rounded-lg ${
                  nft.type === "Legendary"
                    ? "bg-ooze-blue/20 border-2 border-ooze-blue"
                    : "bg-mutagen-green/20 border-2 border-mutagen-green"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {nft.type === "Legendary" ? "💎" : "🔮"}
                  </div>
                  <div>
                    <div className="font-bold">{nft.type} MUTAGEN</div>
                    <div className="text-xs opacity-70">ID: #{nft.id}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-12">
          <StatBox
            title="Confirmed Clicks"
            value={totalClicks}
            icon="🧬"
            color="text-mutagen-green"
          />
          <StatBox
            title="Mutagen Collected"
            value={nfts.length}
            icon="🧪"
            color="text-ooze-blue"
          />
        </div>
      </div>
    </div>
  );
}

// Компонент статистики
const StatBox = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) => (
  <motion.div
    className="bg-dark-slime/50 border-2 border-acid-pink/30 p-4 md:p-6 rounded-2xl backdrop-blur-lg"
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
      <span className={`text-xl md:text-2xl ${color}`}>{icon}</span>
      <h2 className="text-base md:text-xl">{title}</h2>
    </div>
    <div className="text-2xl md:text-4xl font-mono">{value}</div>
  </motion.div>
);
