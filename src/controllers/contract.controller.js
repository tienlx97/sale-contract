const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { contractService } = require('../services');

const createContract = catchAsync(async (req, res) => {
  const contract = await contractService.createContract(req.body);
  res.status(httpStatus.CREATED).send(contract);
});

module.exports = {
  createContract,
};
