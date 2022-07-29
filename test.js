const { expect } = require("chai");
const { ethers, providers } = require("ethers");
// const {loadFixture, deployContract} = waffle;
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { inputToConfig } = require("@ethereum-waffle/compiler");

describe("marketpalce",function(){
    beforeEach(async function () {
        [owner,add1,add2,add3,add4] = await hre.ethers.getSigners();
        Token = await hre.ethers.getContractFactory("MyToken");
        ntoken = await Token.deploy();
        await ntoken.deployed();

        [owner2] = await hre.ethers.getSigners();
        Token = await hre.ethers.getContractFactory("FULNFTMarketplace");
        market = await Token.deploy(ntoken.address);
        await market.deployed();
        // const provider = waffle.provider;
    });
   

    describe("ListNFT",function(){
        it("All condition set",async function(){
            // const mint1 = await ntoken.safeMint(add1.address) 
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2])
            console.log(await ntoken.getApproved(wait.events[0].args[2]));
            console.log(market.address);
            
            expect(await market.connect(add1).listNFT(wait.events[0].args[2],1000))
        });

        it("when contract not approved",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            expect(await market.connect(add1).listNFT(wait.events[0].args[2],1000))
        });

        it("Owner of NFT only able to list",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2])
            expect(await market.listNFT(wait.events[0].args[2],1000))
        });

        it("Lsiting details saved or not",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];

            console.log(await market.connect(add1)._listingData(listingID));

        });
    });
    
    describe("endListing",function(){
        
        it("all things correct",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            // const {listingID} = await loadFixture(listfixture);
            expect(await market.connect(add1).endListing(listingID));
        
        });

        it("If user is not lister then he is not able not end list",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            expect(await market.connect(add2).endListing(listingID));
            
        });

        it("Owner of marketplace also not able to end list ",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            expect(await market.endListing(lnftwait.events[2].args[2]));
        });

        it("If user is not lister then he is not able not endlist",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            expect(await market.connect(add2).endListing(lnftwait.events[2].args[2]));
        });

        it("if list is ended then NFT trasfer to owner",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            await market.connect(add1).endListing(listingID);
            expect(await ntoken.ownerOf(nftId)).to.equal(add1.address)
        });
        it("if nft is sold you can not endlist that NFT",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            await market.connect(add2).buyListedNFT(listingID,{value:1000});
            expect(await market.connect(add1).endListing(listingID));
        });
    });

    describe("cancelListing",function(){
            it("all things correct",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            // const {listingID} = await loadFixture(listfixture);
            expect(await market.connect(add1).cancelListing(listingID));
        
        });

        it("If user is not lister then he is not able not cancellist",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            expect(await market.connect(add2).cancelListing(listingID));
            
        });

        it("Owner of marketplace also not able to cancellist ",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            expect(await market.cancelListing(lnftwait.events[2].args[2]));
        });

        it("If user is not lister then he is not able not cancellist",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            expect(await market.connect(add2).cancelListing(lnftwait.events[2].args[2]));
        });

        it("if list is ended then NFT trasfer to owner",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            await market.connect(add1).cancelListing(listingID);
            expect(await ntoken.ownerOf(nftId)).to.equal(add1.address)
        });
        it("if nft is sold you can not cancellist that NFT",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            await market.connect(add2).buyListedNFT(listingID,{value:1000});
            expect(await market.connect(add1).cancelListing(listingID));
        });
    });

    describe("buyListedNFT",function(){
        it("if all conditions are met",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            expect(await market.connect(add2).buyListedNFT(listingID,{value:1000}));
        });

        it("you can not buy if it already sold",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            await market.connect(add2).buyListedNFT(listingID,{value:1000})
            expect(await market.connect(add2).buyListedNFT(listingID,{value:1000}));
        });

        it("if you not paid Demanded value you can not buy",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            expect(await market.connect(add2).buyListedNFT(listingID,{value:100}));
        });

        it("nft transfer to buyer address",async function(){
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            await market.connect(add2).buyListedNFT(listingID,{value:1000});
            expect(await ntoken.ownerOf(nftId)).to.equal(add2.address)
        });
        it("amount after cutting tx fee transfer to owner of NFT",async function(){
            const provider = waffle.provider;
            const mint = await ntoken.safeMint(add1.address)
            const wait = await mint.wait();
            const nftId = wait.events[0].args[2];
            await ntoken.connect(add1).approve(market.address,wait.events[0].args[2]);
            const lnft = await market.connect(add1).listNFT(wait.events[0].args[2],1000);
            const lnftwait = await lnft.wait();
            const listingID = lnftwait.events[2].args[2];
            // console.log(await provider.getBalance(add1.address));
            const ldata = await market._listingData(listingID);
            // console.log(ldata.demandedAmount);
            const txfee = await market._listingTransactionFee();
            // console.log(((ldata.demandedAmount*txfee)/100))
            const amountTransfer = ldata.demandedAmount - ((ldata.demandedAmount*txfee)/100);
            // console.log(amountTransfer);
            const preBalance = await provider.getBalance(add1.address)
            await market.connect(add2).buyListedNFT(listingID,{value:1000});
            const aftBalance = await provider.getBalance(add1.address);
            // expect(.to.equal(preBalance))
            expect((aftBalance.sub(preBalance)).eq(amountTransfer));
        });
    });

    describe("setListingTrxFee",function(){
        it("if all conditions met",async function(){
            expect(await market.setListingTrxFee(20));
        });

        it("if your not a admin you can not set the transaction fee",async function(){
            expect(await market.connect(add1).setListingTrxFee(20));
        });

        it("admin can not able to set the tx fee more than 49",async function(){
            expect(await market.setListingTrxFee(50));
        });
    });

});
    
    








