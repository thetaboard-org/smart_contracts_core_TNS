const TfuelPriceOracle = artifacts.require('TfuelPriceOracle');

const toBN = require('web3-utils').toBN;

contract('TfuelPriceOracle', function () {
    let priceOracle;

    before(async () => {
        priceOracle = await TfuelPriceOracle.deployed();

        // 100 for 3 character names, 50 for 4 character names,
        // 30 for longer names.
        await priceOracle.setPrices([0, 0, 100, 50, 30]);
    });

    it('should return correct prices', async () => {
        assert.equal((await priceOracle.price("foo")).toNumber(), 100);
        assert.equal((await priceOracle.price("quux")).toNumber(), 50);
        assert.equal((await priceOracle.price("fubar")).toNumber(), 30);
        assert.equal((await priceOracle.price("foobie")).toNumber(), 30);
    });

    it('should work with larger values', async () => {
        await priceOracle.setPrices([toBN("1000000000000000000")]);
        assert.equal((await priceOracle.price("foo")).toString(), "1000000000000000000");
    })
});