import * as Base58 from "base-58"
import * as bip39 from "bip39"
import * as blake2b from "blake2b"
import * as crypto from "crypto"
import HDKey = require("hdkey")
import Long = require("long")
import * as secp256k1 from "secp256k1"
import { chinese_simplified } from "../mnemonic/chinese_simplified"
import { chinese_traditional } from "../mnemonic/chinese_traditional"
import { english } from "../mnemonic/english"
import { french } from "../mnemonic/french"
import { italian } from "../mnemonic/italian"
import { japanese } from "../mnemonic/japanese"
import { korean } from "../mnemonic/korean"
import { spanish } from "../mnemonic/spanish"
import * as proto from "./serialization/proto"

export function blake2bHash(ob: Uint8Array | string): Uint8Array {
    typeof ob === "string" ? ob = Buffer.from(ob) : ob = ob
    return blake2b(32).update(ob).digest()
}

export function publicKeyToAddress(publicKey: Uint8Array): Uint8Array {
    const hash: Uint8Array = blake2bHash(publicKey)
    const address = new Uint8Array(20)
    for (let i = 12; i < 32; i++) {
        address[i - 12] = hash[i]
    }
    return address
}

export function addressToString(publicKey: Uint8Array): string {
    return "H" + Base58.encode(publicKey) + addressCheckSum(publicKey)
}

export function addressToUint8Array(address: string) {
    if (address.charAt(0) !== "H") {
        throw new Error(`Address is invalid. Expected address to start with 'H'`)
    }
    const check = address.slice(-4)
    address = address.slice(1, -4)
    const out: Uint8Array = Base58.decode(address)
    if (out.length !== 20) {
        throw new Error("Address must be 20 bytes long")
    }
    const expectedChecksum = addressCheckSum(out)
    if (expectedChecksum !== check) {
        throw new Error(`Address hash invalid checksum '${check}' expected '${expectedChecksum}'`)
    }
    return out
}

export function addressCheckSum(arr: Uint8Array): string {
    const hash = blake2bHash(arr)
    let str = Base58.encode(hash)
    str = str.slice(0, 4)
    return str
}

export function zeroPad(input: string, length: number) {
    return (Array(length + 1).join("0") + input).slice(-length)
}

export function hycontoString(val: Long): string {
    const int = val.divide(1000000000)
    const sub = val.modulo(1000000000)
    if (sub.isZero()) {
        return int.toString()
    }

    let decimals = sub.toString()
    while (decimals.length < 9) {
        decimals = "0" + decimals
    }

    while (decimals.charAt(decimals.length - 1) === "0") {
        decimals = decimals.substr(0, decimals.length - 1)
    }

    return int.toString() + "." + decimals
}

export function hyconfromString(val: string): Long {
    if (val === "" || val === undefined || val === null) { return Long.fromNumber(0, true) }
    if (val[val.length - 1] === ".") { val += "0" }
    const arr = val.toString().split(".")
    let hycon = Long.fromString(arr[0], true).multiply(Math.pow(10, 9))
    if (arr.length > 1) {
        arr[1] = arr[1].length > 9 ? arr[1].slice(0, 9) : arr[1]
        const subCon = Long.fromString(arr[1], true).multiply(Math.pow(10, 9 - arr[1].length))
        hycon = hycon.add(subCon)
    }
    return hycon.toUnsigned()
}

export function encodingMnemonic(str: string): string {
    return str.normalize("NFKD")
}

export function encrypt(password: string, data: string): { iv: string, encryptedData: string } {
    const key = Buffer.from(blake2bHash(password))
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
    const encryptedData = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()])
    return { iv: iv.toString("hex"), encryptedData: encryptedData.toString("hex") }
}

export function decrypt(password: string, iv: string, data: string): Buffer | boolean {
    try {
        const key = Buffer.from(blake2bHash(password))
        const ivBuffer = Buffer.from(iv, "hex")
        const dataBuffer = Buffer.from(data, "hex")
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer)
        const originalData = Buffer.concat([decipher.update(dataBuffer), decipher.final()])
        return originalData
    } catch (error) {
        return false
    }
}

export function signTx(fromAddress: string, toAddress: string, amount: string, minerFee: string, nonce: number, privateKey: string): { signature: string, recovery: number, newSignature: string, newRecovery: number } {
    try {
        const from = addressToUint8Array(fromAddress)
        const to = addressToUint8Array(toAddress)

        const iTx: proto.ITx = {
            amount: hyconfromString(amount),
            fee: hyconfromString(minerFee),
            from,
            nonce,
            to,
        }

        let signature: string = ""
        let recovery: number = -1
        let newSignature: string = ""
        let newRecovery: number = -1
        const iTxNew = Object.assign({ networkid: "hycon" }, iTx)
        const protoTxNew = proto.Tx.encode(iTxNew).finish()
        const txHashNew = blake2bHash(protoTxNew)
        const newSign = secp256k1.sign(Buffer.from(txHashNew), Buffer.from(privateKey, "hex"))
        if (Date.now() <= 1544108400000) {
            const protoTx = proto.Tx.encode(iTx).finish()
            const txHash = blake2bHash(protoTx)
            const oldSign = secp256k1.sign(Buffer.from(txHash), Buffer.from(privateKey, "hex"))

            signature = oldSign.signature.toString("hex")
            recovery = oldSign.recovery
            newSignature = newSign.signature.toString("hex")
            newRecovery = newSign.recovery
        } else {
            signature = newSign.signature.toString("hex")
            recovery = newSign.recovery
        }

        return { signature, recovery, newSignature, newRecovery }
    } catch (error) {
        throw new Error(`Sign is invalid.`)
    }
}

export function signTxWithHDWallet(toAddress: string, amount: string, minerFee: string, nonce: number, privateExtendedKey: string, index: number): { signature: string, recovery: number, newSignature: string, newRecovery: number } {
    try {
        const { address, privateKey } = deriveWallet(privateExtendedKey, index)
        return this.signTx(address, toAddress, amount, minerFee, nonce, privateKey)
    } catch (error) {
        throw new Error(`Failed to signTxWithHDWallet : ${error}`)
    }
}

export function getMnemonic(language: string): string {
    const wordlist = getBip39Wordlist(language)
    return bip39.generateMnemonic(128, undefined, wordlist)
}

export function createWallet(mnemonic: string, passphrase: string = "", language: string = "english"): { address: string, privateKey: string } {
    try {
        if (!bip39.validateMnemonic(mnemonic, getBip39Wordlist(language))) {
            throw new Error("mnemonic is invalid.")
        }

        const seed: Buffer = bip39.mnemonicToSeed(mnemonic, passphrase)
        const masterKey = HDKey.fromMasterSeed(seed)
        if (!masterKey.privateExtendedKey) {
            throw new Error("masterKey does not have Extended PrivateKey")
        }

        return deriveWallet(masterKey.privateExtendedKey)
    } catch (error) {
        throw new Error(`Fail to createWallet : ${error}`)
    }
}

export function createHDWallet(mnemonic: string, passphrase: string = "", language: string = "english"): string {
    try {
        if (!bip39.validateMnemonic(mnemonic, getBip39Wordlist(language))) {
            throw new Error("mnemonic is invalid.")
        }
        const seed: Buffer = bip39.mnemonicToSeed(mnemonic, passphrase)
        const masterKey = HDKey.fromMasterSeed(seed)
        if (!masterKey.privateExtendedKey) {
            throw new Error("masterKey does not have Extended PrivateKey")
        }
        return masterKey.privateExtendedKey
    } catch (error) {
        throw new Error(`Failed to createHDWallet : ${error}`)
    }
}

export function getWalletFromExtKey(privateExtendedKey: string, index: number): { address: string, privateKey: string } {
    try {
        return deriveWallet(privateExtendedKey, index)
    } catch (error) {
        throw new Error(`Failed to getWalletFromExtKey : ${error}`)
    }
}

function deriveWallet(privateExtendedKey: string, index: number = 0): { address: string, privateKey: string } {
    const hdkey = HDKey.fromExtendedKey(privateExtendedKey)
    const wallet = hdkey.derive(`m/44'/1397'/0'/0/${index}`)
    if (!wallet.privateKey) {
        throw new Error("Not much key information to save wallet")
    }

    if (!secp256k1.privateKeyVerify(wallet.privateKey)) {
        throw new Error("Failed to privateKeyVerify in generate Key with mnemonic")
    }

    if (!(checkPublicKey(wallet.publicKey, wallet.privateKey))) {
        throw new Error("publicKey from masterKey generated by hdkey is not equal publicKey generated by secp256k1")
    }

    const addressBuffer = publicKeyToAddress(wallet.publicKey)
    const address = addressToString(addressBuffer)

    return { address, privateKey: wallet.privateKey.toString("hex") }
}

function getBip39Wordlist(language?: string) {
    switch (language.toLowerCase()) {
        case "english":
            return english
        case "korean":
            return korean
        case "chinese_simplified":
            return chinese_simplified
        case "chinese_traditional":
            return chinese_traditional
        case "chinese":
            throw new Error("Did you mean chinese_simplified or chinese_traditional?")
        case "japanese":
            return japanese
        case "french":
            return french
        case "spanish":
            return spanish
        case "italian":
            return italian
        default:
            return english
    }
}

function checkPublicKey(publicKey: Buffer, privateKey: Buffer): boolean {
    let isEqual = true
    const secpPublicKey = secp256k1.publicKeyCreate(privateKey)
    if (publicKey.length !== secpPublicKey.length) {
        isEqual = false
    } else {
        for (let i = 0; i < publicKey.length; i++) {
            if (publicKey[i] !== secpPublicKey[i]) {
                isEqual = false
                break
            }
        }
    }
    return isEqual
}
