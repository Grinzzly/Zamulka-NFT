require('dotenv').config();
const API_URL = process.env.API_URL;
const {createAlchemyWeb3} = require("@alch/alchemy-web3");
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/ZamulkaNFT.sol/ZamulkaNFT.json");
const contractAddress = "0x2c0331a35A18b5D81742eA84adbd7efEe2C6fE7a";
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);

const METAMASK_PUBLIC_KEY = process.env.METAMASK_PUBLIC_KEY;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
const TOKEN_ID = process.env.TOKEN_ID;

async function mintNFT(tokenURI) {
    // get the nonce - nonce is needed for security reasons. It keeps track of the number of
    // transactions sent from our address and prevents replay attacks.
    const nonce = await alchemyWeb3.eth.getTransactionCount(METAMASK_PUBLIC_KEY, 'latest');

    console.log("MINTing NFT\n");
    nftContract.methods.mint(METAMASK_PUBLIC_KEY, TOKEN_ID, tokenURI)// call the mint function from ZamulkaNFT.sol file and pass the account that should receive the minted NFT.

    const tx = {
        from: METAMASK_PUBLIC_KEY, // our MetaMask public key
        to: contractAddress, // the smart contract address we want to interact with
        nonce: nonce, // nonce with the no of transactions from our account
        gas: 1000000, // fee estimate to complete the transaction
        data: TOKEN_ID,
    };

    const signPromise = alchemyWeb3.eth.accounts.signTransaction(
        tx,
        METAMASK_PRIVATE_KEY
    );
    signPromise
        .then((signedTx) => {
            alchemyWeb3.eth.sendSignedTransaction(
                signedTx.rawTransaction,
                function (err, hash) {
                    if (!err) {
                        console.log(
                            "The hash of transaction is: ",
                            hash,
                            "\nCheck Alchemy's Mempool to view the status of our transaction!"
                        );
                    } else {
                        console.log(
                            "Something went wrong when submitting transaction:",
                            err
                        );
                    }
                }
            );
        })
        .catch((err) => {
            console.log(" Promise failed:", err);
        });
}

mintNFT("https://ipfs.io/ipfs/QmX1yUdJAdZrZHoqAcuBZgXUCaAPNrkQzL99jzXN8h1Umw") // pass the CID to the JSON file uploaded to Pinata
