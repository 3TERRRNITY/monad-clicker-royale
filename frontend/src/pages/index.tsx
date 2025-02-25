import ConnectButton from "@/components/ConnectButton";
import GameInterface from "@/components/GameInterface";
import { ethers } from "ethers";
import { useState } from "react";

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  return (
    <div className="min-h-screen bg-dark-slime">
      <nav className="p-4 bg-dark-slime/80 border-b border-ooze-blue/30 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex justify-end">
          <ConnectButton onConnect={setProvider} />
        </div>
      </nav>

      {provider ? (
        <GameInterface provider={provider} />
      ) : (
        <div className="text-center mt-20 text-xl text-acid-pink neon-text">
          CONNECT WALLET TO START MUTATION!
        </div>
      )}
    </div>
  );
}
