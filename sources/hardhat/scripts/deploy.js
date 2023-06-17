// import
const hre = require("hardhat");

// main func
const main = async ()=>{
	let artistName = "Son Tung MTP"
	const artistFactory = await hre.ethers.getContractFactory(
		"Artist"
	)
	console.log("Deploying contract...");
	const artistContract = await artistFactory.deploy(artistName);
	await artistContract.deployed()
	console.log(artistContract.address);
} 
// run main
main().then(()=>{
	process.exit(0);
})
.catch((error)=>{
	console.error(error);
	process.exit(1);
})