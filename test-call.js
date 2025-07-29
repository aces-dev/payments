const response = await fetch('http://localhost:3000/api/airtel-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '999959024',
    amount: 1000,
    user_uid: 'user_12345'
  })
});

const result = await response.json();
console.log(result);
