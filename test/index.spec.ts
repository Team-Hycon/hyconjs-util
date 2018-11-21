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

    it("Should signTx then decrypt and get same data", () => {
        const {signature, recovery} = utils.signTx("HwTsQGpbicAZsXcmSHN8XmcNR9wXHtw7", "H3GKJpnAXne7iGBLjmHQLFQxpJU8A4wJo", "0.1", "0.000000001", 7, "f35776c86f811d9ab1c66cadc0f503f519bf21898e589c2f26d646e472bfacb2")
        expect(signature).toEqual("f0d8d437b9b0c6175fbaee606c7abcdd2e91233a2e4c2ea8e1d42f96a7be1dba68dfa4d05e506825816e0cd5648139afe9b81b5cc43b840d31a3110f6940e8e1")
        expect(recovery).toEqual(0)
    })
})
