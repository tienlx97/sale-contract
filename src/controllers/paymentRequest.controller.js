const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentRequestService } = require('../services');

function safeFileName(base = 'payment-request', ext = 'pdf') {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `${base}-${stamp}.${ext}`;
}

const createPaymentRequest = catchAsync(async (req, res) => {
  try {
    const { format = 'docx', fileName } = req.query; // ?format=docx|pdf
    const payload = req.body; // your contract DTO

    const buf = await paymentRequestService.createPaymentRequestBuffer(payload, { format });
    const ext = format === 'pdf' ? 'pdf' : 'docx';

    res.setHeader(
      'Content-Type',
      ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    const name = fileName || safeFileName('payment-request', ext);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`);
    res.setHeader('Cache-Control', 'no-store');
    // res.send(buf);
    res.status(httpStatus.CREATED).send(buf);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

const createPaymentRequestTest = catchAsync(async (req, res) => {
  const contract = await paymentRequestService.buildDoc(req.body);
  res.status(httpStatus.CREATED).send(contract);
});

module.exports = {
  createPaymentRequest,
  createPaymentRequestTest,
};
