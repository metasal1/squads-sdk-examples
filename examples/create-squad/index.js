"use strict";
// Programmatic example of creating a Squad
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
const bn_js_1 = __importDefault(require("bn.js"));
// creates a multisig with 1 signer and a single member using the immediate function
const createSquadExample = () => __awaiter(void 0, void 0, void 0, function* () {
    // const walletKeypair = Keypair.generate();
    const walletKeypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array([228, 73, 124, 181, 254, 248, 146, 226, 239, 74, 186, 115, 86, 179, 177, 116, 169, 217, 79, 216, 205, 122, 219, 201, 174, 66, 187, 114, 48, 233, 183, 6, 34, 41, 170, 218, 17, 145, 215, 6, 66, 20, 57, 232, 54, 170, 237, 136, 218, 43, 166, 63, 137, 56, 237, 63, 75, 237, 226, 102, 58, 151, 203, 51]));
    console.log('Wallet Keypair:', walletKeypair.publicKey.toBase58());
    console.log('Wallet Private Key:', walletKeypair.secretKey.toString());
    const squads = sdk_1.default.devnet(new sdk_1.Wallet(walletKeypair));
    // random key so no collision
    const createKey = new web3_js_1.Keypair().publicKey;
    const threshold = 1;
    const members = [walletKeypair.publicKey];
    const name = 'Metasals Squad';
    const description = 'This is a test squad';
    try {
        // airdrop to fund the wallet - may fail occasionally since it defaults to public devnet
        // const sig = await airdrop(squads.connection, walletKeypair.publicKey, LAMPORTS_PER_SOL);
        const multisigAccount = yield squads.createMultisig(threshold, createKey, members, name, description);
        console.log("Successfully created a new multisig at", multisigAccount.publicKey.toBase58());
        console.log('Multisig account:', JSON.stringify(multisigAccount));
        const [vault] = yield (0, sdk_1.getAuthorityPDA)(multisigAccount.publicKey, new bn_js_1.default(1), sdk_1.DEFAULT_MULTISIG_PROGRAM_ID);
        console.log("Default Vault address:", vault.toBase58());
    }
    catch (e) {
        console.log('Error:', e);
    }
});
createSquadExample();
