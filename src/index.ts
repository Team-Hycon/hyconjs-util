import * as Base58 from "base-58"
import * as blake2b from "blake2b"
import Long = require("long")

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