const admin = require('firebase-admin');
const FIREBASE_CONN = require('./config');

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_CONN),
  projectId: "aces-mw",  // Add your project ID here
});

const db = admin.firestore();

async function saveTransactionToFirebase(transactionData) {
  try {
    const docRef = await db.collection('airtel_transactions').add({
      ...transactionData,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Transaction saved to Firebase with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving transaction to Firebase:', error);
    throw error;
  }
}

module.exports = saveTransactionToFirebase;