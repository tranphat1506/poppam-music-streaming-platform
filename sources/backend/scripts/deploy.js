// import
const hre = require("hardhat");

// main func
const main = async ()=>{
	const albumFactory = await hre.ethers.getContractFactory(
		"Muzik3"
	)
	console.log("Deploying contract...");
	const albumContract = await albumFactory.deploy();
	await albumContract.deployed();
	console.log(albumContract.address);
} 
// run main
main().then(()=>{
	process.exit(0);
})
.catch((error)=>{
	console.error(error);
	process.exit(1);
})