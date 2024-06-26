"use strict";
// Programmatic example of creating a Squad with 3 members, creating a mint, assigning the authority to the vault and minting a token
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importStar(require("@sqds/sdk"));
const web3_js_1 = require("@solana/web3.js");
const sdk_2 = require("@sqds/sdk");
const bn_js_1 = __importDefault(require("bn.js"));
const spl_token_1 = require("@solana/spl-token");
// const walletKeypair = Keypair.generate();
const walletKeypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array([54, 138, 156, 241, 182, 204, 234, 176, 250, 228, 105, 125, 111, 239, 33, 196, 173, 250, 26, 205, 243, 242, 227, 34, 220, 249, 134, 79, 132, 133, 95, 195, 243, 50, 181, 7, 87, 35, 64, 243, 121, 246, 186, 252, 238, 123, 168, 147, 199, 21, 158, 110, 166, 214, 224, 27, 6, 24, 142, 172, 34, 183, 237, 114]));
console.log('Wallet Keypair:', walletKeypair.publicKey.toBase58());
console.log('Wallet Private Key:', walletKeypair.secretKey.toString());
const squads = sdk_1.default.devnet(new sdk_2.Wallet(walletKeypair));
// it is highly recommended that you use a different RPC NODE ie.
// const squads = Squads.endpoint(YOUR_RPC_NODE, new Wallet(walletKeypair));
// creates a multisig with 1 signer and a single member using the immediate function
const createSquad = (members, threshold) => __awaiter(void 0, void 0, void 0, function* () {
    // random key so no collision
    const createKey = new web3_js_1.Keypair().publicKey;
    const name = 'Test Squad';
    const description = 'This is a test squad';
    try {
        const multisigAccount = yield squads.createMultisig(threshold, createKey, members, name, description);
        console.log("Successfully created a new multisig at", multisigAccount.publicKey.toBase58());
        console.log('Multisig account:', JSON.stringify(multisigAccount));
        const [vault] = yield (0, sdk_1.getAuthorityPDA)(multisigAccount.publicKey, new bn_js_1.default(1), sdk_1.DEFAULT_MULTISIG_PROGRAM_ID);
        console.log("Default Vault address:", vault.toBase58());
        return { multisigPublicKey: multisigAccount.publicKey, vaultPublicKey: vault };
    }
    catch (e) {
        console.log('Error:', e);
        throw e;
    }
});
// for simplicity, all of the methods being used are immediate, so a new instance of the Squads SDK is instantiated for each "wallet"
// note that some of the commitment levels fluctuate to accomodate devnet and immediacy
const mintExample = () => __awaiter(void 0, void 0, void 0, function* () {
    // airdrop to fund the wallet - may fail occasionally since it defaults to public devnet
    // await airdrop(squads.connection, walletKeypair.publicKey, LAMPORTS_PER_SOL);
    const payerBalance = yield squads.connection.getBalance(walletKeypair.publicKey, "confirmed");
    // validate airdrop
    console.log(payerBalance);
    const otherMembersBesidesWallet = [
        web3_js_1.Keypair.generate(),
        web3_js_1.Keypair.generate(),
    ];
    const initMembers = [walletKeypair.publicKey, ...otherMembersBesidesWallet.map(kp => kp.publicKey)];
    const initThreshold = 2;
    const { multisigPublicKey, vaultPublicKey } = yield createSquad(initMembers, initThreshold);
    // await airdrop(squads.connection, vaultPublicKey, LAMPORTS_PER_SOL);
    // Create a mint, and assign the authority to the vault
    const newMint = yield (0, spl_token_1.createMint)(squads.connection, walletKeypair, vaultPublicKey, vaultPublicKey, 0, undefined, { commitment: 'processed', skipPreflight: true });
    console.log("New mint created at ", newMint.toBase58());
    // wallet that will get the minted token
    const recipientWallet = web3_js_1.Keypair.generate().publicKey;
    // will need to create an ata for this wallet
    const recipientTokenAccount = yield (0, spl_token_1.createAssociatedTokenAccount)(squads.connection, walletKeypair, newMint, recipientWallet, { commitment: "confirmed" });
    console.log("Recipient token account created at ", recipientTokenAccount.toBase58());
    // Create a multisig instruction to mint a token and send it to the recipient wallet
    const mintTokenInstruction = yield (0, spl_token_1.createMintToInstruction)(newMint, recipientTokenAccount, vaultPublicKey, 1);
    console.log("Mint token instruction created", mintTokenInstruction);
    // create the multisig transaction - use default authority Vault (1)
    const multisigTransaction = yield squads.createTransaction(multisigPublicKey, 1);
    // add the instruction to the transaction
    const ixRes = yield squads.addInstruction(multisigTransaction.publicKey, mintTokenInstruction);
    console.log('Instruction added to transaction:', JSON.stringify(ixRes));
    // activate the transaction so all members can vote on it
    yield squads.activateTransaction(multisigTransaction.publicKey);
    // vote on the transaction
    yield squads.approveTransaction(multisigTransaction.publicKey);
    const firstTxState = yield squads.getTransaction(multisigTransaction.publicKey);
    console.log('Transaction state:', firstTxState.status);
    // still need one more approval from another member, so we'll use the other member's wallet
    const otherMemberWallet = new sdk_2.Wallet(otherMembersBesidesWallet[0]);
    // make sure there are lamports in the wallet
    // await airdrop(squads.connection, otherMemberWallet.publicKey, LAMPORTS_PER_SOL);
    const otherMemberSquads = sdk_1.default.devnet(otherMemberWallet);
    yield otherMemberSquads.approveTransaction(multisigTransaction.publicKey);
    // now you can also check the transaction state, as it should be "executeReady" as the 2/3 threshold has been met
    const transaction = yield squads.getTransaction(multisigTransaction.publicKey);
    console.log('Transaction state:', transaction.status);
    // finally, we have the last member wallet execute it if we like
    const executorMemberWallet = new sdk_2.Wallet(otherMembersBesidesWallet[1]);
    const executorMemberSquads = sdk_1.default.devnet(executorMemberWallet);
    // make sure there are lamports in the wallet
    // await airdrop(squads.connection, executorMemberWallet.publicKey, LAMPORTS_PER_SOL);
    // execute the transaction
    yield executorMemberSquads.executeTransaction(multisigTransaction.publicKey);
    const postExecuteState = yield squads.getTransaction(multisigTransaction.publicKey);
    console.log('Transaction state:', postExecuteState.status);
    // now we should be able to see that the recipient wallet has a token
    const receipientTokenAccountValue = yield squads.connection.getTokenAccountBalance(recipientTokenAccount, "processed");
    console.log('Recipient token account balance:', receipientTokenAccountValue.value.uiAmount);
});
mintExample();
