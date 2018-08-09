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

        const result = utils.decrypt(password+'.', iv, encryptedData)
        expect(result).toBeFalsy()
    })
})
