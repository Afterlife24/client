const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');



// scanmeprod-productionFIRESTORE
// const firebaseConfig = {
//   apiKey: "AIzaSyBwMWR-QyG3LnkeOmI5_QBbI_FoL_skIHc",
//   authDomain: "scanmeprod.firebaseapp.com",
//   projectId: "scanmeprod",
//   storageBucket: "scanmeprod.appspot.com",
//   messagingSenderId: "3426314793",
//   appId: "1:3426314793:web:ec931d424b430196ae4a38",
//   measurementId: "G-K7TP3HFDM0"
// };


// const firebaseConfig = {
//     apiKey: "AIzaSyCQk1KdAXHzFevM5Atgtl57eHnTzQ12eYI",
//     authDomain: "token-cab71.firebaseapp.com",
//     projectId: "token-cab71",
//     storageBucket: "token-cab71.appspot.com",
//     messagingSenderId: "610364184109",
//     appId: "1:610364184109:web:b118083d997124851dcaa4",
//     measurementId: "G-T9J8H0WNSS"
//   };

// secondproductionchange

// const firebaseConfig = {
//   apiKey: "AIzaSyD6l1wSl0Wzf2v1FBlPskOYEthSRFAKp58",
//   authDomain: "scanme-372e3.firebaseapp.com",
//   databaseURL: "https://scanme-372e3-default-rtdb.firebaseio.com",
//   projectId: "scanme-372e3",
//   storageBucket: "scanme-372e3.appspot.com",
//   messagingSenderId: "948074886578",
//   appId: "1:948074886578:web:80a62ba4fb8f3d24a3a0ab",
//   measurementId: "G-HBMXG6WXR0"
// };



  const firebaseConfig = {
    apiKey: "AIzaSyAdPjzBE2EjsCaTP5aBQ9w1-_TKL2zttw8",
    authDomain: "tapandcollect-abe43.firebaseapp.com",
    projectId: "tapandcollect-abe43",
    storageBucket: "tapandcollect-abe43.appspot.com",
    messagingSenderId: "835659748911",
    appId: "1:835659748911:web:effae864ee493a85b798da",
    measurementId: "G-DE5GCGGHRJ"
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  module.exports = { db };
  