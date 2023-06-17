require("@nomicfoundation/hardhat-toolbox");

//https://hardhat.org/hardhat-runner/docs/config#json-rpc-based-networks

//Note: keep your mnemonic and private keys securely
//Read more: https://hardhat.org/hardhat-runner/docs/config#hd-wallet-config
//1) You can configure private keys or mnemonic:
let accounts = ["5724435745628ab3a37a8ebfef55f8dcf04d15d71e0b6e0d4474de846bec8c61"]
//let accounts = { mnemonic: "your mnemonic here", }

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.18",
	//2) select the default network "gnosis" or "chiado"
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
		},
		gnosis: {
			url: "https://rpc.gnosischain.com",
			accounts: accounts,
		},
		chiado: {
			url: "https://rpc.chiadochain.net",
			gasPrice: 1000000000,
			accounts: accounts,
		},
	},
	etherscan: {
		customChains: [
			{
				network: "chiado",
				chainId: 10200,
				urls: {
					//Blockscout
					apiURL: "https://blockscout.com/gnosis/chiado/api",
					browserURL: "https://blockscout.com/gnosis/chiado",
				},
			},
			{
				network: "gnosis",
				chainId: 100,
				urls: {
					// 3) Select to what explorer verify the contracts
					// Gnosisscan
					apiURL: "https://api.gnosisscan.io/api",
					browserURL: "https://gnosisscan.io/",
					// Blockscout
					//apiURL: "https://blockscout.com/xdai/mainnet/api",
					//browserURL: "https://blockscout.com/xdai/mainnet",
				},
			},
		],
		apiKey: {
			//4) Insert your Gnosisscan API key
			//blockscout explorer verification does not require keys
			chiado: "your key",
			gnosis: "7TPV47BY98MXDXVRP3JJ8D8E9AB7VF8V8M",
		},
	}
};