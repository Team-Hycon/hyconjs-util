import "jasmine"
import * as utils from "../src/index"

describe("Test", () => {

    it("Should encrypt then decrypt and get same data", () => {
        const data = "H497fHm8gbPZxaXySKpV17a7beYBF9Ut3"
        const password = "t3sTP@sSw0rd!"

        const { iv, encryptedData } = utils.encrypt(password, data)
        expect(encryptedData).not.toEqual(data)
        expect(iv).toBeDefined()

        const decryptedData = utils.decrypt(password, iv, encryptedData)
        expect(decryptedData.toString()).toEqual(data)

        const result = utils.decrypt(password + ".", iv, encryptedData)
        expect(result).toBeFalsy()
    })

    it("Should signTx then get same data", () => {
        const result = utils.signTx("H3N2sCstx81NvvVy3hkrhGsNS43834YWw", "H497fHm8gbPZxaXySKpV17a7beYBF9Ut3", "0.000000001", "0.000000001", 1024, "e09167abb9327bb3748e5dd1b9d3d40832b33eb0b041deeee8e44ff47030a61d")
        expect(result.signature).toEqual("769f69d5a11f634dcb1e8b8f081c6b36b2e37b0a8f1b416314d5a3ceac27cc631e0ec12fd04473e8a168e2556897c55cd7f5e06f3ab917729176aa2e4b002d52")
        expect(result.recovery).toEqual(0)
        expect(result.newSignature).toEqual("fd67de0827ccf8bc957eeb185ba0ea78aa1cd5cad74aea40244361ee7df68e36025aebc4ae6b18628135ea3ef5a70ea3681a7082c44af0899f0f59b50f2707b9")
        expect(result.newRecovery).toEqual(1)
    })

    it("Should createWallet then get same data", () => {
        const result = utils.createWallet("ring crime symptom enough erupt lady behave ramp apart settle citizen junk")
        expect(result.address).toEqual("HwTsQGpbicAZsXcmSHN8XmcNR9wXHtw7")
        expect(result.privateKey).toEqual("f35776c86f811d9ab1c66cadc0f503f519bf21898e589c2f26d646e472bfacb2")
    })

    it("Should createWallet with passphrase then get same data", () => {
        const result = utils.createWallet("way prefer push tooth bench hover orchard brother crumble nothing wink retire", "TREZOR")
        expect(result.address).toEqual("H3fFn71jR6G33sAVMASDtLFhrq38h8FQ1")
        expect(result.privateKey).toEqual("4c28ef543da7ee616d91ba786ce73ef02cf29818f3cdf5a4639771921a2cf843")
    })
})
