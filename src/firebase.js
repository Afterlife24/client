const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// sacnmeaug-testFIRESTORE
// const firebaseConfig = {
//   apiKey: "AIzaSyBRMy3DskWcx_4h2VDfpN3MyZgWY8_ITZc",
//   authDomain: "scanmeaug.firebaseapp.com",
//   projectId: "scanmeaug",
//   storageBucket: "scanmeaug.appspot.com",
//   messagingSenderId: "135980053063",
//   appId: "1:135980053063:web:6ad1cde97e35a65e5b3762"
// };


// scanmeprod-productionFIRESTORE
const firebaseConfig = {
  apiKey: "AIzaSyBwMWR-QyG3LnkeOmI5_QBbI_FoL_skIHc",
  authDomain: "scanmeprod.firebaseapp.com",
  projectId: "scanmeprod",
  storageBucket: "scanmeprod.appspot.com",
  messagingSenderId: "3426314793",
  appId: "1:3426314793:web:ec931d424b430196ae4a38",
  measurementId: "G-K7TP3HFDM0"
};


  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  module.exports = { db };
  