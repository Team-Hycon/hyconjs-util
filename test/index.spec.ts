import "jasmine"
import Long = require("long")
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
        const result = utils.signTx(
            "H3N2sCstx81NvvVy3hkrhGsNS43834YWw",
            "H497fHm8gbPZxaXySKpV17a7beYBF9Ut3",
            "0.000000001",
            "0.000000001",
            1024,
            "e09167abb9327bb3748e5dd1b9d3d40832b33eb0b041deeee8e44ff47030a61d",
            "hycon",
        )
        expect(result.signature).toEqual("fd67de0827ccf8bc957eeb185ba0ea78aa1cd5cad74aea40244361ee7df68e36025aebc4ae6b18628135ea3ef5a70ea3681a7082c44af0899f0f59b50f2707b9")
        expect(result.recovery).toEqual(1)
    })

    it("Should signTxWithHDWallet then get same data", () => {
        const result = utils.signTxWithHDWallet(
            "H3N2sCstx81NvvVy3hkrhGsNS43834YWw",
            "0.000000001",
            "0.000000001",
            1,
            "xprv9s21ZrQH143K4bekgsnc9DtUYZzjjjT9MrcZfQHvKKq7CkifHoAXC58LBFGjjpX6bSyp31mwTtbEMW6NAjV19QaQj6hVpz5Nphr3XiN5fbT",
            0,
            "hycon",
        )
        expect(result.signature).toEqual("dbc4d77c31fbb69be70056b18dfe1e832585d65bd72284d7f503db9ff806d6100e5823172b6b1b1f30ac7ce1895d4c98baa23331951da980a59b2cc2abd797bb")
        expect(result.recovery).toEqual(1)
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

    it("Should createHDWallet then get same data", () => {
        const result = utils.createHDWallet("length segment syrup visa lava beach rain crush false reveal alone olympic")
        expect(result).toEqual("xprv9s21ZrQH143K2gffZBzfnUUUjR5MfiQKNj1xXfwuHtxu7yzAPTMC6Gr6D5Krx2nPWVHoe6xDFTV6h6A2oZqXd5DbQowofFLS2fuk2RaU4tE")
    })

    it("Should createHDWallet with passphrase then get same data", () => {
        const result = utils.createHDWallet("length segment syrup visa lava beach rain crush false reveal alone olympic", "TREZOR")
        expect(result).toEqual("xprv9s21ZrQH143K4bekgsnc9DtUYZzjjjT9MrcZfQHvKKq7CkifHoAXC58LBFGjjpX6bSyp31mwTtbEMW6NAjV19QaQj6hVpz5Nphr3XiN5fbT")
    })

    it("Should getWalletFromExtKey then get same data", () => {
        const result = utils.getWalletFromExtKey("xprv9s21ZrQH143K4bekgsnc9DtUYZzjjjT9MrcZfQHvKKq7CkifHoAXC58LBFGjjpX6bSyp31mwTtbEMW6NAjV19QaQj6hVpz5Nphr3XiN5fbT", 1)
        expect(result.address).toEqual("H3cpQEhLs3pmwyTnv7PBHmux8CrRBA72d")
        expect(result.privateKey).toEqual("1a6374f984be521f09a96c4842ec3e66a37e0239b95bd0e13d9632fa8f7dbc4a")
    })

    it("Should strict Add is overflow data", () => {
        function result() { return utils.strictAdd(Long.MAX_UNSIGNED_VALUE, Long.UONE) }
        expect(result).toThrowError()
    })

    it("Should strict Add is correct data", () => {
        const result = utils.strictAdd(utils.hyconfromString("234.72031"), utils.hyconfromString("180.400000001"))
        expect(utils.hycontoString(result)).toEqual("415.120310001")
    })
})
