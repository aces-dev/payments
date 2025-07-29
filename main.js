const express = require('express');
const AirtelPayment = require('./AirtelPayment');
const saveTransactionToFirebase = require('./FirebaseConn');

const app = express();
app.use(express.json());

const payment = new AirtelPayment();

app.post('/api/airtel-payment', async (req, res) => {
  const { phone, amount, user_uid, purhcase_data } = req.body;

  if (!phone || !amount || !user_uid) {
    return res.status(400).json({
      success: false,
      error: 'Missing required: phone, amount, user_uid'
    });
  }

  const normalizedPhone = phone.replace(/\D/g, '');
  const numericAmount = Number(amount);

  try {
    const result = await payment.process({ phone, amount, user_uid });

    const success = result?.status?.success ?? result?.success ?? false;
    const code = result?.status?.code ?? (success ? '200' : '400');
    const transaction_id = result?.data?.transaction?.id ?? null;

    const transactionData = {
      success,
      code,
      transaction_id,
      user_uid,
      amount: numericAmount,
      phone: normalizedPhone,
      airtel_responce: result,
      purhcase_data: purhcase_data || null
    };

    await saveTransactionToFirebase(transactionData);

    if (success) {
      return res.json({
        success: true,
        code,
        transaction_id,
        user_uid,
        amount: numericAmount,
        phone: normalizedPhone
      });
    }

    return res.status(400).json({
      success: false,
      code,
      error: result?.error || 'Payment failed',
      user_uid,
      result: result,
      amount: numericAmount,
      phone: normalizedPhone
    });

  } catch (error) {
    console.error('Error in payment processing:', error);

    const fallbackResponse = {
      success: false,
      code: '500',
      transaction_id: null,
      user_uid,
      amount: numericAmount,
      phone: normalizedPhone,
      airtel_responce: { error: error.message },
      purhcase_data: purhcase_data || null,
      error_message: error.message
    };

    try {
      await saveTransactionToFirebase(fallbackResponse);
    } catch (firebaseError) {
      console.error('Failed to save error transaction to Firebase:', firebaseError);
    }

    return res.status(500).json({
      success: false,
      code: '500',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Airtel Payment API → :${PORT}`));
module.exports = app;