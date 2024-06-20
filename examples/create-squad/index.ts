// Programmatic example of creating a Squad

import Squads, { DEFAULT_MULTISIG_PROGRAM_ID, getAuthorityPDA, Wallet } from '@sqds/sdk';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';

import { airdrop } from "../functions";

// creates a multisig with 1 signer and a single member using the immediate function
const createSquadExample = async () => {
    // const walletKeypair = Keypair.generate();
    const walletKeypair = Keypair.fromSecretKey(new Uint8Array([228, 73, 124, 181, 254, 248, 146, 226, 239, 74, 186, 115, 86, 179, 177, 116, 169, 217, 79, 216, 205, 122, 219, 201, 174, 66, 187, 114, 48, 233, 183, 6, 34, 41, 170, 218, 17, 145, 215, 6, 66, 20, 57, 232, 54, 170, 237, 136, 218, 43, 166, 63, 137, 56, 237, 63, 75, 237, 226, 102, 58, 151, 203, 51]));
    console.log('Wallet Keypair:', walletKeypair.publicKey.toBase58());
    console.log('Wallet Private Key:', walletKeypair.secretKey.toString());
    const squads = Squads.devnet(new Wallet(walletKeypair));
    // random key so no collision
    const createKey = new Keypair().publicKey;
    const threshold = 1;
    const members = [walletKeypair.publicKey];
    const name = 'Metasals Squad';
    const description = 'This is a test squad';

    try {
        // airdrop to fund the wallet - may fail occasionally since it defaults to public devnet
        // const sig = await airdrop(squads.connection, walletKeypair.publicKey, LAMPORTS_PER_SOL);
        const multisigAccount = await squads.createMultisig(threshold, createKey, members, name, description);
        console.log("Successfully created a new multisig at", multisigAccount.publicKey.toBase58());
        console.log('Multisig account:', JSON.stringify(multisigAccount));
        const [vault] = await getAuthorityPDA(multisigAccount.publicKey, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);
        console.log("Default Vault address:", vault.toBase58());
    } catch (e) {
        console.log('Error:', e);
    }
};

createSquadExample();