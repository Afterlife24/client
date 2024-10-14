//     const React = require('react');
//     const { useState, useEffect } = require('react');
//     const { db } = require('./firebase');
//     const { collection, onSnapshot, query, orderBy, where } = require('firebase/firestore');
//     const dayjs = require('dayjs');

//     const AdminDashboard = () => {
//         const [orders, setOrders] = useState([]);
//         const [orderCounts, setOrderCounts] = useState([]);
//         const [error, setError] = useState(null);
//         const [selectedTable, setSelectedTable] = useState(1);
//         const [orderDelivered, setOrderDelivered] = useState({});
//         const [activeTab, setActiveTab] = useState('all');
//         const [timeRange, setTimeRange] = useState('1day');

//         useEffect(() => {
//             const getOrdersQuery = () => {
//                 const ordersRef = collection(db, 'orders');
//                 let date = new Date();
//                 switch (timeRange) {
//                     case '1day':
//                         date = dayjs().subtract(1, 'day').toDate();
//                         break;
//                     case '3days':
//                         date = dayjs().subtract(3, 'day').toDate();
//                         break;
//                     case '1week':
//                         date = dayjs().subtract(1, 'week').toDate();
//                         break;
//                     case '15days':
//                         date = dayjs().subtract(15, 'day').toDate();
//                         break;
//                     case '1month':
//                         date = dayjs().subtract(1, 'month').toDate();
//                         break;
//                     default:
//                         date = dayjs().subtract(1, 'day').toDate();
//                 }
//                 return query(ordersRef, where('createdAt', '>=', date), orderBy('createdAt', 'desc'));
//             };

//             const unsubscribe = onSnapshot(getOrdersQuery(), (snapshot) => {
//                 const ordersList = snapshot.docs.map(doc => {
//                     const data = doc.data();
//                     return { id: doc.id, ...data, createdAt: data.createdAt.toDate() };
//                 });
//                 setOrders(ordersList);

//                 const deliveredStatus = {};
//                 ordersList.forEach(order => {
//                     deliveredStatus[order.id] = order.isDelivered;
//                 });
//                 setOrderDelivered(deliveredStatus);
//             }, (error) => {
//                 setError(error.message);
//             });

//             return () => unsubscribe();
//         }, [timeRange]);

//         useEffect(() => {
//             const orderCountMap = {};
//             orders.forEach(order => {
//                 const date = order.createdAt.toLocaleDateString();
//                 orderCountMap[date] = (orderCountMap[date] || 0) + 1;
//             });
//             const counts = Object.entries(orderCountMap).map(([date, count]) => ({
//                 date,
//                 count
//             }));
//             setOrderCounts(counts);
//         }, [orders]);

//         const handleBoxClick = (tableNumber) => {
//             setSelectedTable(tableNumber);
//         };

//         const handleOrderDelivered = async (orderId) => {
//             try {
//                 await fetch('https://server-server.gofastapi.com/markAsDelivered', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ orderId }),
//                 });

//                 setOrderDelivered(prev => ({
//                     ...prev,
//                     [orderId]: true,
//                 }));
//             } catch (error) {
//                 console.error('Error marking order as delivered:', error);
//             }
//         };

//         const getOrderDetails = (tableNumber) => {
//             return orders.filter(order => order.tableNumber === tableNumber && (activeTab === 'all' || !order.isDelivered));
//         };

//         const getOrderColor = (orderId) => {
//             return orderDelivered[orderId] ? '#90EE90' : '#FF6347';
//         };

//         const isTableAllDelivered = (tableNumber) => {
//             const tableOrders = getOrderDetails(tableNumber);
//             return tableOrders.every(order => orderDelivered[order.id]);
//         };

//         const handleTabClick = (tab) => {
//             setActiveTab(tab);
//             setSelectedTable(1);
//         };

//         const handleTimeRangeChange = (event) => {
//             setTimeRange(event.target.value);
//         };

//         return (
//             <div style={styles.container}>
//                 <div style={styles.sidebar}>
//                     <h1 style={styles.header}>Menu</h1>
//                     <ul style={styles.menuList}>
//                         <li
//                             style={{ ...styles.menuItem, backgroundColor: activeTab === 'all' ? 'white' : '#444', color: activeTab === 'all' ? 'black' : 'white' }}
//                             onClick={() => handleTabClick('all')}
//                         >
//                             All Orders
//                         </li>
//                         <li
//                             style={{ ...styles.menuItem, backgroundColor: activeTab === 'pending' ? 'white' : '#444', color: activeTab === 'pending' ? 'black' : 'white' }}
//                             onClick={() => handleTabClick('pending')}
//                         >
//                             Pending Orders
//                         </li>
//                         <li
//                             style={{ ...styles.menuItem, backgroundColor: activeTab === 'charts' ? 'white' : '#444', color: activeTab === 'charts' ? 'black' : 'white' }}
//                             onClick={() => handleTabClick('charts')}
//                         >
//                             Order Count
//                         </li>
//                     </ul>
//                 </div>
//                 <div style={styles.tablesSection}>
//                     <h1 style={styles.header}>Tables</h1>
//                     {error ? (
//                         <p style={styles.error}>Error: {error}</p>
//                     ) : (
//                         <div style={styles.grid}>
//                             {Array.from({ length: 10 }, (_, i) => i + 1).map(tableNumber => (
//                                 <div
//                                     key={tableNumber}
//                                     onClick={() => handleBoxClick(tableNumber)}
//                                     style={{
//                                         ...styles.tableBox,
//                                         backgroundColor: getOrderDetails(tableNumber).length && !isTableAllDelivered(tableNumber) ? '#FF6347' : '#90EE90'
//                                     }}
//                                 >
//                                     Table {tableNumber}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//                 <div style={styles.ordersSection}>
//                     <div style={styles.ordersContainer}>
//                         <div style={styles.headerContainer}>
//                             <h1 style={styles.header}>
//                                 {activeTab === 'charts' ? 'Order Counts' : `Order Details for Table ${selectedTable}`}
//                             </h1>
//                             <select style={styles.dropdown} value={timeRange} onChange={handleTimeRangeChange}>
//                                 <option value="1day">Last 1 day</option>
//                                 <option value="3days">Last 3 days</option>
//                                 <option value="1week">Last 1 week</option>
//                                 <option value="15days">Last 15 days</option>
//                                 <option value="1month">Last 1 month</option>
//                             </select>
//                         </div>

//                         {activeTab !== 'charts' && selectedTable && (
//                             <div style={styles.ordersTableContainer}>
//                                 <table style={styles.table}>
//                                     <thead>
//                                         <tr>
//                                             <th style={styles.tableHeader}>Dish</th>
//                                             <th style={styles.tableHeader}>Quantity</th>
//                                             <th style={styles.tableHeader}>Date</th>
//                                             <th style={styles.tableHeader}>Time</th>
//                                             <th style={styles.tableHeader}>Status</th>
//                                             <th style={styles.tableHeader}>Action</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {getOrderDetails(selectedTable).length ? (
//                                             getOrderDetails(selectedTable).map((order) => (
//                                                 <tr key={order.id} style={{ ...styles.tableRow, backgroundColor: getOrderColor(order.id) }}>
//                                                     <td style={styles.tableCell}>
//                                                         <div style={styles.dishContainer}>
//                                                             {order.dishes.map((dish, index) => (
//                                                                 <div key={index} style={styles.dishBox}>
//                                                                     {dish.name}
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </td>
//                                                     <td style={styles.tableCell}>
//                                                         <div style={styles.dishContainer}>
//                                                             {order.dishes.map((dish, index) => (
//                                                                 <div key={index} style={styles.dishBox}>
//                                                                     {dish.quantity}
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </td>
//                                                     <td style={styles.tableCell}>
//                                                         {order.createdAt.toLocaleDateString()}
//                                                     </td>
//                                                     <td style={styles.tableCell}>
//                                                         {order.createdAt.toLocaleTimeString()}
//                                                     </td>
//                                                     <td style={styles.tableCell}>
//                                                         {orderDelivered[order.id] ? 'Delivered' : 'Pending'}
//                                                     </td>
//                                                     <td style={styles.tableCell}>
//                                                         <button
//                                                             style={orderDelivered[order.id] ? styles.buttonDelivered : styles.button}
//                                                             onClick={() => handleOrderDelivered(order.id)}
//                                                         >
//                                                             {orderDelivered[order.id] ? 'Delivered' : 'Mark as Delivered'}
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan="6" style={styles.noOrdersCell}>
//                                                     {activeTab === 'pending' ? 'No pending orders for this table' : 'No orders for this table'}
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}

//                         {activeTab === 'charts' && (
//                             <div style={styles.chartContainer}>
//                                 <table style={styles.table}>
//                                     <thead>
//                                         <tr>
//                                             <th style={styles.tableHeader}>Date</th>
//                                             <th style={styles.tableHeader}>Order Count</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {orderCounts.map((orderCount, index) => (
//                                             <tr key={index} style={styles.tableRow}>
//                                                 <td style={styles.tableCell}>{orderCount.date}</td>
//                                                 <td style={styles.tableCell}>{orderCount.count}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     };




//     const styles = {
//         container: {
//             display: 'flex',
//             minHeight: '100vh',
//             backgroundColor: '#F8F8F8',
//             fontFamily: 'Arial, sans-serif',
//         },
//         sidebar: {
//             width: '200px',
//             backgroundColor: '#333',
//             color: '#FFF',
//             padding: '20px',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//         },
//         menuList: {
//             listStyleType: 'none',
//             padding: 0,
//             margin: 0,
//             width: '100%',
//         },
//         menuItem: {
//             padding: '10px',
//             cursor: 'pointer',
//             textAlign: 'center',
//             borderRadius: '5px',
//             marginBottom: '10px',
//         },
//         tablesSection: {
//             flex: 1,
//             padding: '20px',
//         },
//         header: {
//             margin: '10px 0',
//         },
//         error: {
//             color: 'red',
//         },
//         grid: {
//             display: 'grid',
//             gridTemplateColumns: 'repeat(3, 1fr)',
//             gap: '10px',
//         },
//         tableBox: {
//             padding: '20px',
//             backgroundColor: '#EEE',
//             borderRadius: '5px',
//             cursor: 'pointer',
//             textAlign: 'center',
//         },
//         ordersSection: {
//             flex: 3,
//             padding: '20px',
//             backgroundColor: '#f0f0f5',
//             borderRadius: '10px',
//             boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//         },
//         ordersContainer: {
//             backgroundColor: '#FFF',
//             borderRadius: '10px',
//             boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
//             padding: '20px',
//         },
//         headerContainer: {
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//         },
//         dropdown: {
//             padding: '10px',
//             fontSize: '16px',
//             border: '1px solid #ccc',
//             borderRadius: '5px',
//         },
//         ordersTableContainer: {
//             maxHeight: '650px',
//             overflowY: 'auto',
//             marginTop: '20px',
//         },
//         table: {
//             width: '100%',
//             borderCollapse: 'collapse',
//         },
//         tableHeader: {
//             border: '1px solid #ccc',
//             padding: '10px',
//             backgroundColor: '#007BFF',
//             color: 'white',
//             textAlign: 'left',
//         },
//         tableRow: {
//             transition: 'background-color 0.3s',
//         },
//         tableCell: {
//             border: '1px solid #ccc',
//             padding: '10px',
//             verticalAlign: 'top',
//         },
//         dishContainer: {
//             display: 'flex',
//             flexDirection: 'column',
//         },
//         dishBox: {
//             padding: '5px',
//             border: '1px solid #ddd',
//             borderRadius: '3px',
//             marginBottom: '5px',
//             backgroundColor: '#f6f6f3', // light grey background color
//         },
//         button: {
//             backgroundColor: '#000', // initial background color
//             color: '#FFF', // initial text color
//             padding: '10px 15px',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//             transition: 'background-color 0.3s, color 0.3s',
//         },
//         buttonDelivered: {
//             backgroundColor: '#FFF', // background color when button is pressed
//             color: '#000', // text color when button is pressed
//             padding: '10px 15px',
//             border: '1px solid #000',
//             borderRadius: '5px',
//             cursor: 'pointer',
//             transition: 'background-color 0.3s, color 0.3s',
//         },
//         noOrdersCell: {
//             textAlign: 'center',
//             padding: '10px',
//             color: '#666',
//         },
//     };

// export default AdminDashboard;
    

// ------------------------------------------------------------------------------------------------------------------------------------

const React = require('react');
const { useState, useEffect } = require('react');
const { db } = require('./firebase');
const { collection, onSnapshot, query, orderBy, where } = require('firebase/firestore');
const dayjs = require('dayjs');

const AdminDashboard = () => {
 const [orders, setOrders] = useState([]);
 const [orderCounts, setOrderCounts] = useState([]);
 // const [error, setError] = useState(null);
 const [selectedTable, setSelectedTable] = useState(1);
 const [orderDelivered, setOrderDelivered] = useState({});
 const [activeTab, setActiveTab] = useState('all');
 const [timeRange, setTimeRange] = useState('1day');
 const [tapCollectTokenMap, setTapCollectTokenMap] = useState({});
 //const [sentTokenOrders, setSentTokenOrders] = useState({}); 

 useEffect(() => {
 const getOrdersQuery = () => {
 const ordersRef = collection(db, 'orders');
 let date = new Date();
 switch (timeRange) {
 case '1day':
 date = dayjs().subtract(1, 'day').toDate();
 break;
 case '3days':
 date = dayjs().subtract(3, 'day').toDate();
 break;
 case '1week':
 date = dayjs().subtract(1, 'week').toDate();
 break;
 case '15days':
 date = dayjs().subtract(15, 'day').toDate();
 break;
 case '1month':
 date = dayjs().subtract(1, 'month').toDate();
 break;
 default:
 date = dayjs().subtract(1, 'day').toDate();
 }
 return query(ordersRef, where('createdAt', '>=', date), orderBy('createdAt', 'desc'));
 };
 
 const unsubscribe = onSnapshot(getOrdersQuery(), (snapshot) => {
 const ordersList = snapshot.docs.map(doc => {
 const data = doc.data();
 return { id: doc.id, ...data, createdAt: data.createdAt.toDate() };
 });
 ordersList.sort((a, b) => b.createdAt - a.createdAt);

 setOrders(ordersList);

 const newTapCollectTokens = {};
 ordersList.forEach(order => {
 if (!tapCollectTokenMap[order.id] && order.tableNumber === 0) {
 const tokenId = order.tokenId; // Use tokenId from the order
 newTapCollectTokens[order.id] = tokenId;
 }
 });

 
 // Update the token map and sent token orders
 setTapCollectTokenMap(prev => ({ ...prev, ...newTapCollectTokens }));
 //setSentTokenOrders(newSentTokenOrders);
 //}
 
 // Update delivery status for orders
 const deliveredStatus = {};
 ordersList.forEach(order => {
 deliveredStatus[order.id] = order.isDelivered;
 });
 setOrderDelivered(deliveredStatus);
 });
 
 return () => unsubscribe();
 }, [timeRange, tapCollectTokenMap]); //, sentTokenOrders



useEffect(() => {
 const orderCountMap = {};
 orders.forEach(order => {
 const date = order.createdAt.toLocaleDateString();
 orderCountMap[date] = (orderCountMap[date] || 0) + 1;
 });
 const counts = Object.entries(orderCountMap).map(([date, count]) => ({
 date,
 count
 }));
 setOrderCounts(counts);
}, [orders]);




const handleBoxClick = (tableNumber) => {
 setSelectedTable(tableNumber);
};


const handleOrderDelivered = async (orderId) => {
 try {
 await fetch('https://server-server.gofastapi.com/markAsDelivered', {
 
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ orderId }),
 });

 setOrderDelivered(prev => ({
 ...prev,
 [orderId]: true,
 }));
 } catch (error) {
 console.error('Error marking order as delivered:', error);
 }
};

const getOrderDetails = (tableNumber) => {
 return orders.filter(order => order.tableNumber === tableNumber && (activeTab === 'all' || (activeTab === 'pending' && !order.isDelivered)));
};

const getOrderColor = (orderId) => {
 return orderDelivered[orderId] ? '#90EE90' : '#FF6347';
};

const isTableAllDelivered = (tableNumber) => {
 const tableOrders = getOrderDetails(tableNumber);
 return tableOrders.every(order => orderDelivered[order.id]);
};

const handleTabClick = (tab) => {
 setActiveTab(tab);
 setSelectedTable(1);
};

const handleTimeRangeChange = (event) => {
 setTimeRange(event.target.value);
};

const getTapAndCollectOrders = () => {
return orders.filter(order => order.tableNumber === 0);
};

 return (
 <div style={styles.container}>
 <div style={styles.sidebar}>
 <h1 style={styles.header}>Menu</h1>
 <ul style={styles.menuList}>
 <li
 style={{ ...styles.menuItem, backgroundColor: activeTab === 'all' ? 'white' : '#444', color: activeTab === 'all' ? 'black' : 'white' }}
 onClick={() => handleTabClick('all')}
 >
 All Orders
 </li>
 <li
 style={{ ...styles.menuItem, backgroundColor: activeTab === 'pending' ? 'white' : '#444', color: activeTab === 'pending' ? 'black' : 'white' }}
 onClick={() => handleTabClick('pending')}
 >
 Pending Orders
 </li>
 <li
 style={{ ...styles.menuItem, backgroundColor: activeTab === 'charts' ? 'white' : '#444', color: activeTab === 'charts' ? 'black' : 'white' }}
 onClick={() => handleTabClick('charts')}
 >
 Order Count
 </li>
 <li
 style={{ ...styles.menuItem, backgroundColor: activeTab === 'tapAndCollect' ? 'white' : '#444', color: activeTab === 'tapAndCollect' ? 'black' : 'white' }}
 onClick={() => handleTabClick('tapAndCollect')}
 >
 Tap and Collect
 </li>
 </ul>
 </div>
 <div style={styles.tablesSection}>
 {activeTab !== 'tapAndCollect' && (
 <>
 <h1 style={styles.header}>Tables</h1>
 <div style={styles.grid}>
 {Array.from({ length: 10 }, (_, i) => i + 1).map(tableNumber => (
 <div
 key={tableNumber}
 onClick={() => handleBoxClick(tableNumber)}
 style={{
 ...styles.tableBox,
 backgroundColor: getOrderDetails(tableNumber).length && !isTableAllDelivered(tableNumber) ? '#FF6347' : '#90EE90'
 }}
 >
 Table {tableNumber}
 </div>
 ))}
 </div>
 </>
 )}
 </div>
 <div style={styles.ordersSection}>
 <div style={styles.ordersContainer}>
 <div style={styles.headerContainer}>
 <h1 style={styles.header}>
 {activeTab === 'charts' ? 'Order Counts' : activeTab === 'tapAndCollect' ? 'Tap and Collect Orders' : `Order Details for Table ${selectedTable}`}
 </h1>
 <select style={styles.dropdown} value={timeRange} onChange={handleTimeRangeChange}>
 <option value="1day">Last 1 day</option>
 <option value="3days">Last 3 days</option>
 <option value="1week">Last 1 week</option>
 <option value="15days">Last 15 days</option>
 <option value="1month">Last 1 month</option>
 </select>
 </div>

 {activeTab !== 'charts' && activeTab !== 'tapAndCollect' && selectedTable && (
 <div style={styles.ordersTableContainer}>
 <table style={styles.table}>
 <thead>
 <tr>
 <th style={styles.tableHeader}>Dish</th>
 <th style={styles.tableHeader}>Quantity</th>
 <th style={styles.tableHeader}>Date</th>
 <th style={styles.tableHeader}>Time</th>
 <th style={styles.tableHeader}>Status</th>
 <th style={styles.tableHeader}></th>
 </tr>
 </thead>
 <tbody>
 {getOrderDetails(selectedTable).length ? (
 getOrderDetails(selectedTable).map((order) => (
 <tr key={order.id} style={{ backgroundColor: getOrderColor(order.id) }}>
 <td style={styles.tableCell}>
 <div style={styles.dishContainer}>
 {order.dishes.map((dish, index) => (
 <div key={index} style={styles.dishBox}>
 {dish.name}
 </div>
 ))}
 </div>
 </td>
 <td style={styles.tableCell}>
 <div style={styles.dishContainer}>
 {order.dishes.map((dish, index) => (
 <div key={index} style={styles.dishBox}>
 {dish.quantity}
 </div>
 ))}
 </div>
 </td>
 <td style={styles.tableCell}>
 {order.createdAt.toLocaleDateString()}
 </td>
 <td style={styles.tableCell}>
 {order.createdAt.toLocaleTimeString()}
 </td>
 <td style={styles.tableCell}>
 {orderDelivered[order.id] ? 'Delivered' : 'Pending'}
 </td>
 <td style={styles.tableCell}>
 {!orderDelivered[order.id] && (
 <button
 onClick={() => handleOrderDelivered(order.id)}
 style={styles.deliverButton}
 >
 Mark as Delivered
 </button>
 )}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan="6" style={styles.noOrdersCell}>
 No orders available for this table
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === 'tapAndCollect' && (
 <div style={styles.ordersTableContainer}>
 <table style={styles.table}>
 <thead>
 <tr>
 <th style={styles.tableHeader}>Token ID</th>
 <th style={styles.tableHeader}>Dish</th>
 <th style={styles.tableHeader}>Quantity</th>
 <th style={styles.tableHeader}>Date</th>
 <th style={styles.tableHeader}>Time</th>
 <th style={styles.tableHeader}>Status</th>
 <th style={styles.tableHeader}></th>
 </tr>
 </thead>
 <tbody>
 {getTapAndCollectOrders().length ? (
 getTapAndCollectOrders().map((order) => (
 <tr key={order.id} style={{ ...styles.tableRow, backgroundColor: getOrderColor(order.id) }}>
 <td style={styles.tableCell}>
 {tapCollectTokenMap[order.id]}
 </td>
 <td style={styles.tableCell}>
 <div style={styles.dishContainer}>
 {order.dishes.map((dish, index) => (
 <div key={index} style={styles.dishBox}>
 {dish.name}
 </div>
 ))}
 </div>
 </td>
 <td style={styles.tableCell}>
 <div style={styles.dishContainer}>
 {order.dishes.map((dish, index) => (
 <div key={index} style={styles.dishBox}>
 {dish.quantity}
 </div>
 ))}
 </div>
 </td>
 <td style={styles.tableCell}>
 {order.createdAt.toLocaleDateString()}
 </td>
 <td style={styles.tableCell}>
 {order.createdAt.toLocaleTimeString()}
 </td>
 <td style={styles.tableCell}>
 {orderDelivered[order.id] ? 'Delivered' : 'Pending'}
 </td>
 <td style={styles.tableCell}>
 {!orderDelivered[order.id] && (
 <button
 onClick={() => handleOrderDelivered(order.id)}
 style={styles.deliverButton}
 >
 Mark as Delivered
 </button>
 )}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan="6" style={styles.noOrdersCell}>
 No Tap and Collect orders available
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === 'charts' && (
 <div style={styles.ordersTableContainer}>
 <table style={styles.table}>
 <thead>
 <tr>
 <th style={styles.tableHeader}>Date</th>
 <th style={styles.tableHeader}>Number of Orders</th>
 </tr>
 </thead>
 <tbody>
 {orderCounts.length ? (
 orderCounts.map((count, index) => (
 <tr key={index}>
 <td style={styles.tableCell}>
 {count.date}
 </td>
 <td style={styles.tableCell}>
 {count.count}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan="2" style={styles.noOrdersCell}>
 No order counts available
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

// Styles
const styles = {
 container: { display: 'flex', height: '100vh' },
 sidebar: { width: '20%', backgroundColor: '#333', color: 'white', padding: '20px' },
 header: { fontSize: '24px', marginBottom: '20px' },
 menuList: { listStyleType: 'none', padding: '0' },
 menuItem: { padding: '10px', margin: '5px 0', cursor: 'pointer', textAlign: 'center', borderRadius: '4px' },
 tablesSection: { width: '20%', padding: '20px' },
 grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
 tableBox: { padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#ddd', borderRadius: '4px' },
 ordersSection: { width: '60%', padding: '20px' },
 ordersContainer: { width: '100%', padding: '20px' },
 headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
 dropdown: { padding: '10px', fontSize: '16px' },
 ordersTableContainer: { marginTop: '20px' },
 table: { width: '100%', borderCollapse: 'collapse' },
 tableHeader: { padding: '10px', borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9', textAlign: 'left' },
 tableCell: { padding: '10px', borderBottom: '1px solid #ddd' },
 noOrdersCell: { padding: '20px', textAlign: 'center', color: '#999' },
 dishContainer: { display: 'flex', flexDirection: 'column' },
 dishBox: { padding: '5px 0' },
 deliverButton: { padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};
export default AdminDashboard;



// --------------------------------------------------------------------------------------------------------------------------------


// const React = require('react');
// const { useState, useEffect } = require('react');
// const { db } = require('./firebase');
// const { collection, onSnapshot, query, orderBy, where } = require('firebase/firestore');
// const dayjs = require('dayjs');

// const AdminDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [orderCounts, setOrderCounts] = useState([]);
//   // const [error, setError] = useState(null);
//   const [selectedTable, setSelectedTable] = useState(1);
//   const [orderDelivered, setOrderDelivered] = useState({});
//   const [activeTab, setActiveTab] = useState('all');
//   const [timeRange, setTimeRange] = useState('1day');
//   const [tapCollectTokenMap, setTapCollectTokenMap] = useState({});
//   const [tokenMap, setTokenMap] = useState({});
//   //const [sentTokenOrders, setSentTokenOrders] = useState({}); 

//   useEffect(() => {
//     const getOrdersQuery = () => {
//       const ordersRef = collection(db, 'orders');
//       let date = new Date();
//       switch (timeRange) {
//         case '1day':
//           date = dayjs().subtract(1, 'day').toDate();
//           break;
//         case '3days':
//           date = dayjs().subtract(3, 'day').toDate();
//           break;
//         case '1week':
//           date = dayjs().subtract(1, 'week').toDate();
//           break;
//         case '15days':
//           date = dayjs().subtract(15, 'day').toDate();
//           break;
//         case '1month':
//           date = dayjs().subtract(1, 'month').toDate();
//           break;
//         default:
//           date = dayjs().subtract(1, 'day').toDate();
//       }
//       return query(
//         ordersRef,
//         where('createdAt', '>=', date),
//         orderBy('createdAt', 'desc')
//       );
//     };

//     const unsubscribe = onSnapshot(getOrdersQuery(), (snapshot) => {
//       const ordersList = snapshot.docs.map(doc => {
//         const data = doc.data();
//         return { id: doc.id, ...data, createdAt: data.createdAt.toDate() };
//       });
//       ordersList.sort((a, b) => b.createdAt - a.createdAt);

//       setOrders(ordersList);

//       // Populate tokenMap for all orders
//       const newTokens = {};
//       ordersList.forEach(order => {
//         if (!tokenMap[order.id] && order.tokenId) {
//           newTokens[order.id] = order.tokenId;
//         }
//       });
//       setTokenMap(prev => ({ ...prev, ...newTokens }));

//       // Populate tapCollectTokenMap for Tap and Collect orders
//       const newTapCollectTokens = {};
//       ordersList.forEach(order => {
//         if (!tapCollectTokenMap[order.id] && order.tableNumber === 0) {
//           const tokenId = order.tokenId; // Use tokenId from the order
//           newTapCollectTokens[order.id] = tokenId;
//         }
//       });
//       setTapCollectTokenMap(prev => ({ ...prev, ...newTapCollectTokens }));

//       // Update delivery status for orders
//       const deliveredStatus = {};
//       ordersList.forEach(order => {
//         deliveredStatus[order.id] = order.isDelivered;
//       });
//       setOrderDelivered(deliveredStatus);
//     });

//     return () => unsubscribe();
//   }, [timeRange, tapCollectTokenMap, tokenMap]); // Added tokenMap as dependency

//   useEffect(() => {
//     const orderCountMap = {};
//     orders.forEach(order => {
//       const date = order.createdAt.toLocaleDateString();
//       orderCountMap[date] = (orderCountMap[date] || 0) + 1;
//     });
//     const counts = Object.entries(orderCountMap).map(([date, count]) => ({
//       date,
//       count
//     }));
//     setOrderCounts(counts);
//   }, [orders]);

//   const handleBoxClick = (tableNumber) => {
//     setSelectedTable(tableNumber);
//     setActiveTab('all'); // Ensure that selecting a table switches to 'all' tab
//   };

//   const handleOrderDelivered = async (orderId) => {
//     try {
//       await fetch('https://server-server.gofastapi.com/markAsDelivered', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ orderId }),
//       });

//       setOrderDelivered(prev => ({
//         ...prev,
//         [orderId]: true,
//       }));
//     } catch (error) {
//       console.error('Error marking order as delivered:', error);
//     }
//   };

//   const getOrderDetails = (tableNumber) => {
//     return orders.filter(order => 
//       order.tableNumber === tableNumber && 
//       (activeTab === 'all' || (activeTab === 'pending' && !order.isDelivered))
//     );
//   };

//   const getOrderColor = (orderId) => {
//     return orderDelivered[orderId] ? '#90EE90' : '#FF6347';
//   };

//   const isTableAllDelivered = (tableNumber) => {
//     const tableOrders = getOrderDetails(tableNumber);
//     return tableOrders.every(order => orderDelivered[order.id]);
//   };

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     if (tab !== 'all') {
//       setSelectedTable(null); // Deselect table when switching tabs
//     } else {
//       setSelectedTable(1); // Reset to table 1 when switching back to 'all'
//     }
//   };

//   const handleTimeRangeChange = (event) => {
//     setTimeRange(event.target.value);
//   };

//   const getTapAndCollectOrders = () => {
//     return orders.filter(order => order.tableNumber === 0);
//   };

//   const getAllOrders = () => {
//     return orders.filter(order => order.tableNumber !== 0);
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.sidebar}>
//         <h1 style={styles.header}>Menu</h1>
//         <ul style={styles.menuList}>
//           <li
//             style={{ 
//               ...styles.menuItem, 
//               backgroundColor: activeTab === 'all' ? 'white' : '#444', 
//               color: activeTab === 'all' ? 'black' : 'white' 
//             }}
//             onClick={() => handleTabClick('all')}
//           >
//             All Orders
//           </li>
//           <li
//             style={{ 
//               ...styles.menuItem, 
//               backgroundColor: activeTab === 'pending' ? 'white' : '#444', 
//               color: activeTab === 'pending' ? 'black' : 'white' 
//             }}
//             onClick={() => handleTabClick('pending')}
//           >
//             Pending Orders
//           </li>
//           <li
//             style={{ 
//               ...styles.menuItem, 
//               backgroundColor: activeTab === 'charts' ? 'white' : '#444', 
//               color: activeTab === 'charts' ? 'black' : 'white' 
//             }}
//             onClick={() => handleTabClick('charts')}
//           >
//             Order Count
//           </li>
//           <li
//             style={{ 
//               ...styles.menuItem, 
//               backgroundColor: activeTab === 'tapAndCollect' ? 'white' : '#444', 
//               color: activeTab === 'tapAndCollect' ? 'black' : 'white' 
//             }}
//             onClick={() => handleTabClick('tapAndCollect')}
//           >
//             Tap and Collect
//           </li>
//         </ul>
//       </div>
//       <div style={styles.tablesSection}>
//         {activeTab !== 'tapAndCollect' && (
//           <>
//             <h1 style={styles.header}>Tables</h1>
//             <div style={styles.grid}>
//               {Array.from({ length: 10 }, (_, i) => i + 1).map(tableNumber => (
//                 <div
//                   key={tableNumber}
//                   onClick={() => handleBoxClick(tableNumber)}
//                   style={{
//                     ...styles.tableBox,
//                     backgroundColor: getOrderDetails(tableNumber).length && !isTableAllDelivered(tableNumber) ? '#FF6347' : '#90EE90'
//                   }}
//                 >
//                   Table {tableNumber}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//       <div style={styles.ordersSection}>
//         <div style={styles.ordersContainer}>
//           <div style={styles.headerContainer}>
//             <h1 style={styles.header}>
//               {activeTab === 'charts' 
//                 ? 'Order Counts' 
//                 : activeTab === 'tapAndCollect' 
//                   ? 'Tap and Collect Orders' 
//                   : activeTab === 'all' && selectedTable 
//                     ? `Order Details for Table ${selectedTable}` 
//                     : 'All Orders'}
//             </h1>
//             <select style={styles.dropdown} value={timeRange} onChange={handleTimeRangeChange}>
//               <option value="1day">Last 1 day</option>
//               <option value="3days">Last 3 days</option>
//               <option value="1week">Last 1 week</option>
//               <option value="15days">Last 15 days</option>
//               <option value="1month">Last 1 month</option>
//             </select>
//           </div>

//           {activeTab !== 'charts' && activeTab !== 'tapAndCollect' && (
//             <div style={styles.ordersTableContainer}>
//               {activeTab === 'all' && selectedTable ? (
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       <th style={styles.tableHeader}>Token ID</th>
//                       <th style={styles.tableHeader}>Dish</th>
//                       <th style={styles.tableHeader}>Quantity</th>
//                       <th style={styles.tableHeader}>Date</th>
//                       <th style={styles.tableHeader}>Time</th>
//                       <th style={styles.tableHeader}>Status</th>
//                       <th style={styles.tableHeader}></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getOrderDetails(selectedTable).length ? (
//                       getOrderDetails(selectedTable).map((order) => (
//                         <tr key={order.id} style={{ backgroundColor: getOrderColor(order.id) }}>
//                           <td style={styles.tableCell}>
//                             {tokenMap[order.id] || 'N/A'}
//                           </td>
//                           <td style={styles.tableCell}>
//                             <div style={styles.dishContainer}>
//                               {order.dishes.map((dish, index) => (
//                                 <div key={index} style={styles.dishBox}>
//                                   {dish.name}
//                                 </div>
//                               ))}
//                             </div>
//                           </td>
//                           <td style={styles.tableCell}>
//                             <div style={styles.dishContainer}>
//                               {order.dishes.map((dish, index) => (
//                                 <div key={index} style={styles.dishBox}>
//                                   {dish.quantity}
//                                 </div>
//                               ))}
//                             </div>
//                           </td>
//                           <td style={styles.tableCell}>
//                             {order.createdAt.toLocaleDateString()}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {order.createdAt.toLocaleTimeString()}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {orderDelivered[order.id] ? 'Delivered' : 'Pending'}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {!orderDelivered[order.id] && (
//                               <button
//                                 onClick={() => handleOrderDelivered(order.id)}
//                                 style={styles.deliverButton}
//                               >
//                                 Mark as Delivered
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="7" style={styles.noOrdersCell}>
//                           No orders available for this table
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               ) : (
//                 // If no specific table is selected, show all orders except tableNumber=0
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       <th style={styles.tableHeader}>Token ID</th>
//                       <th style={styles.tableHeader}>Table Number</th>
//                       <th style={styles.tableHeader}>Dish</th>
//                       <th style={styles.tableHeader}>Quantity</th>
//                       <th style={styles.tableHeader}>Date</th>
//                       <th style={styles.tableHeader}>Time</th>
//                       <th style={styles.tableHeader}>Status</th>
//                       <th style={styles.tableHeader}></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getAllOrders().length ? (
//                       getAllOrders().map((order) => (
//                         <tr key={order.id} style={{ backgroundColor: getOrderColor(order.id) }}>
//                           <td style={styles.tableCell}>
//                             {tokenMap[order.id] || 'N/A'}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {order.tableNumber}
//                           </td>
//                           <td style={styles.tableCell}>
//                             <div style={styles.dishContainer}>
//                               {order.dishes.map((dish, index) => (
//                                 <div key={index} style={styles.dishBox}>
//                                   {dish.name}
//                                 </div>
//                               ))}
//                             </div>
//                           </td>
//                           <td style={styles.tableCell}>
//                             <div style={styles.dishContainer}>
//                               {order.dishes.map((dish, index) => (
//                                 <div key={index} style={styles.dishBox}>
//                                   {dish.quantity}
//                                 </div>
//                               ))}
//                             </div>
//                           </td>
//                           <td style={styles.tableCell}>
//                             {order.createdAt.toLocaleDateString()}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {order.createdAt.toLocaleTimeString()}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {orderDelivered[order.id] ? 'Delivered' : 'Pending'}
//                           </td>
//                           <td style={styles.tableCell}>
//                             {!orderDelivered[order.id] && (
//                               <button
//                                 onClick={() => handleOrderDelivered(order.id)}
//                                 style={styles.deliverButton}
//                               >
//                                 Mark as Delivered
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="8" style={styles.noOrdersCell}>
//                           No orders available
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           )}

//           {activeTab === 'tapAndCollect' && (
//             <div style={styles.ordersTableContainer}>
//               <table style={styles.table}>
//                 <thead>
//                   <tr>
//                     <th style={styles.tableHeader}>Token ID</th>
//                     <th style={styles.tableHeader}>Dish</th>
//                     <th style={styles.tableHeader}>Quantity</th>
//                     <th style={styles.tableHeader}>Date</th>
//                     <th style={styles.tableHeader}>Time</th>
//                     <th style={styles.tableHeader}>Status</th>
//                     <th style={styles.tableHeader}></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {getTapAndCollectOrders().length ? (
//                     getTapAndCollectOrders().map((order) => (
//                       <tr key={order.id} style={{ backgroundColor: getOrderColor(order.id) }}>
//                         <td style={styles.tableCell}>
//                           {tapCollectTokenMap[order.id] || 'N/A'}
//                         </td>
//                         <td style={styles.tableCell}>
//                           <div style={styles.dishContainer}>
//                             {order.dishes.map((dish, index) => (
//                               <div key={index} style={styles.dishBox}>
//                                 {dish.name}
//                               </div>
//                             ))}
//                           </div>
//                         </td>
//                         <td style={styles.tableCell}>
//                           <div style={styles.dishContainer}>
//                             {order.dishes.map((dish, index) => (
//                               <div key={index} style={styles.dishBox}>
//                                 {dish.quantity}
//                               </div>
//                             ))}
//                           </div>
//                         </td>
//                         <td style={styles.tableCell}>
//                           {order.createdAt.toLocaleDateString()}
//                         </td>
//                         <td style={styles.tableCell}>
//                           {order.createdAt.toLocaleTimeString()}
//                         </td>
//                         <td style={styles.tableCell}>
//                           {orderDelivered[order.id] ? 'Delivered' : 'Pending'}
//                         </td>
//                         <td style={styles.tableCell}>
//                           {!orderDelivered[order.id] && (
//                             <button
//                               onClick={() => handleOrderDelivered(order.id)}
//                               style={styles.deliverButton}
//                             >
//                               Mark as Delivered
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" style={styles.noOrdersCell}>
//                         No Tap and Collect orders available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {activeTab === 'charts' && (
//             <div style={styles.ordersTableContainer}>
//               <table style={styles.table}>
//                 <thead>
//                   <tr>
//                     <th style={styles.tableHeader}>Date</th>
//                     <th style={styles.tableHeader}>Number of Orders</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orderCounts.length ? (
//                     orderCounts.map((count, index) => (
//                       <tr key={index}>
//                         <td style={styles.tableCell}>
//                           {count.date}
//                         </td>
//                         <td style={styles.tableCell}>
//                           {count.count}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="2" style={styles.noOrdersCell}>
//                         No order counts available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Styles
// const styles = {
//   container: { display: 'flex', height: '100vh' },
//   sidebar: { width: '20%', backgroundColor: '#333', color: 'white', padding: '20px' },
//   header: { fontSize: '24px', marginBottom: '20px' },
//   menuList: { listStyleType: 'none', padding: '0' },
//   menuItem: { 
//     padding: '10px', 
//     margin: '5px 0', 
//     cursor: 'pointer', 
//     textAlign: 'center', 
//     borderRadius: '4px',
//     transition: 'background-color 0.3s, color 0.3s'
//   },
//   tablesSection: { width: '20%', padding: '20px' },
//   grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
//   tableBox: { 
//     padding: '20px', 
//     textAlign: 'center', 
//     cursor: 'pointer', 
//     backgroundColor: '#ddd', 
//     borderRadius: '4px',
//     transition: 'background-color 0.3s'
//   },
//   ordersSection: { width: '60%', padding: '20px', overflowY: 'auto' },
//   ordersContainer: { width: '100%', padding: '20px' },
//   headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//   dropdown: { padding: '10px', fontSize: '16px' },
//   ordersTableContainer: { marginTop: '20px' },
//   table: { width: '100%', borderCollapse: 'collapse' },
//   tableHeader: { 
//     padding: '10px', 
//     borderBottom: '1px solid #ddd', 
//     backgroundColor: '#f9f9f9', 
//     textAlign: 'left',
//     position: 'sticky',
//     top: 0,
//     background: '#f9f9f9',
//     zIndex: 1
//   },
//   tableCell: { padding: '10px', borderBottom: '1px solid #ddd' },
//   noOrdersCell: { padding: '20px', textAlign: 'center', color: '#999' },
//   dishContainer: { display: 'flex', flexDirection: 'column' },
//   dishBox: { padding: '5px 0' },
//   deliverButton: { 
//     padding: '5px 10px', 
//     backgroundColor: '#4CAF50', 
//     color: 'white', 
//     border: 'none', 
//     borderRadius: '4px', 
//     cursor: 'pointer',
//     transition: 'background-color 0.3s'
//   }
// };

// export default AdminDashboard;


































// ------------------------------------------------------------------------------------------------
