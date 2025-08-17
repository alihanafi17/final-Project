// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import styles from "./adminPage.module.css";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   LineChart,
//   Line,
// } from "recharts";

// function AdminOrderStats() {
//   const [stats, setStats] = useState(null);
//   const [topProducts, setTopProducts] = useState([]);
//   const [revenueTrend, setRevenueTrend] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const statsRes = await axios.get(
//         "http://localhost:8801/orders/stats/dashboard"
//       );
//       setStats(statsRes.data);

//       const topProductsRes = await axios.get(
//         "http://localhost:8801/orders/stats/top-products"
//       );
//       setTopProducts(topProductsRes.data || []);

//       const trendRes = await axios.get(
//         "http://localhost:8801/orders/stats/revenue-trend"
//       );
//       setRevenueTrend(trendRes.data || []);
//     } catch (err) {
//       console.error("Failed to fetch order statistics", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadExcel = async () => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `http://localhost:8801/orders/stats/export?startDate=${startDate}&endDate=${endDate}`,
//         { responseType: "blob" }
//       );

//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `orders_${startDate}_to_${endDate}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       if (err.response && err.response.status === 404) {
//         alert("No data found for the selected date range.");
//       } else {
//         console.error("Failed to download Excel:", err);
//       }
//     }
//   };

//   const downloadProductExcel = async () => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `http://localhost:8801/orders/stats/products?startDate=${startDate}&endDate=${endDate}`,
//         { responseType: "blob" }
//       );

//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute(
//         "download",
//         `product_sales_${startDate}_to_${endDate}.xlsx`
//       );
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       if (err.response && err.response.status === 404) {
//         alert("No product sales found for the selected date range.");
//       } else {
//         console.error("Failed to download product Excel:", err);
//       }
//     }
//   };

//   if (loading)
//     return <div className={styles.loading}>Loading statistics...</div>;

//   if (!stats)
//     return <div className={styles.loading}>No statistics available.</div>;

//   return (
//     <div className={styles.statsContainer}>
//       <h2>Order Statistics</h2>

//       {/* Date Range Picker & Download Buttons */}
//       <div className={styles.dateRangeContainer}>
//         <label>
//           Start Date:{" "}
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </label>
//         <label>
//           End Date:{" "}
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </label>
//         <button onClick={downloadExcel} className={styles.downloadButton}>
//           Download Orders Excel
//         </button>
//         <button
//           onClick={downloadProductExcel}
//           className={styles.downloadButton}
//         >
//           Download Product Summary Excel
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div className={styles.statsGrid}>
//         <div className={styles.statCard}>
//           <h3>Most Ordered Product</h3>
//           <p>{stats.most_ordered_product || "N/A"}</p>
//         </div>
//         <div className={styles.statCard}>
//           <h3>Total Revenue</h3>
//           <p>${Number(stats.total_revenue || 0).toFixed(2)}</p>
//         </div>
//         <div className={styles.statCard}>
//           <h3>Total Orders</h3>
//           <p>{stats.total_orders || 0}</p>
//         </div>
//         <div className={styles.statCard}>
//           <h3>Most Active Customer</h3>
//           <p>{stats.most_active_customer || "N/A"}</p>
//         </div>
//       </div>

//       {/* Bar Chart: Top Products */}
//       {topProducts.length > 0 && (
//         <div className={styles.chartContainer}>
//           <h3>Top 5 Best-Selling Products</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart
//               data={topProducts}
//               margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
//             >
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="quantity" fill="#82ca9d" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       )}

//       {/* Pie Chart: Orders Distribution */}
//       {topProducts.length > 0 && (
//         <div className={styles.chartContainer}>
//           <h3>Orders Distribution (Top Products)</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={topProducts}
//                 dataKey="quantity"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={100}
//                 label
//               >
//                 {topProducts.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Legend />
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       )}

//       {/* Line Chart: Revenue Trend */}
//       {revenueTrend.length > 0 && (
//         <div className={styles.chartContainer}>
//           <h3>Monthly Revenue Trend</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={revenueTrend}>
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="revenue"
//                 stroke="#ff7300"
//                 strokeWidth={3}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminOrderStats;
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./adminPage.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

function AdminOrderStats() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderId, setOrderId] = useState(""); // New state for single order

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsRes = await axios.get(
        "http://localhost:8801/orders/stats/dashboard"
      );
      setStats(statsRes.data);

      const topProductsRes = await axios.get(
        "http://localhost:8801/orders/stats/top-products"
      );
      setTopProducts(topProductsRes.data || []);

      const trendRes = await axios.get(
        "http://localhost:8801/orders/stats/revenue-trend"
      );
      setRevenueTrend(trendRes.data || []);
    } catch (err) {
      console.error("Failed to fetch order statistics", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8801/orders/stats/export?startDate=${startDate}&endDate=${endDate}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("No data found for the selected date range.");
      } else {
        console.error("Failed to download Excel:", err);
      }
    }
  };

  const downloadProductExcel = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8801/orders/stats/products?startDate=${startDate}&endDate=${endDate}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `product_sales_${startDate}_to_${endDate}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("No product sales found for the selected date range.");
      } else {
        console.error("Failed to download product Excel:", err);
      }
    }
  };

  // New function: Download a specific order Excel
  const downloadSingleOrderExcel = async () => {
    if (!orderId) {
      alert("Please enter an order ID.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8801/orders/export/${orderId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `order_${orderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("Order not found.");
      } else {
        console.error("Failed to download single order Excel:", err);
      }
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading statistics...</div>;
  if (!stats)
    return <div className={styles.loading}>No statistics available.</div>;

  return (
    <div className={styles.statsContainer}>
      <h2>Order Statistics</h2>

      {/* Date Range Picker & Download Buttons */}
      <div className={styles.dateRangeContainer}>
        <label>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={downloadExcel} className={styles.downloadButton}>
          Download Orders Excel
        </button>
        <button
          onClick={downloadProductExcel}
          className={styles.downloadButton}
        >
          Download Product Summary Excel
        </button>
      </div>

      {/* Single Order Excel Download */}
      <div className={styles.singleOrderContainer}>
        <label>
          Order ID:{" "}
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </label>
        <button
          onClick={downloadSingleOrderExcel}
          className={styles.downloadButton}
        >
          Download Single Order Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Most Ordered Product</h3>
          <p>{stats.most_ordered_product || "N/A"}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Revenue</h3>
          <p>${Number(stats.total_revenue || 0).toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Orders</h3>
          <p>{stats.total_orders || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Most Active Customer</h3>
          <p>{stats.most_active_customer || "N/A"}</p>
        </div>
      </div>

      {/* Bar Chart: Top Products */}
      {topProducts.length > 0 && (
        <div className={styles.chartContainer}>
          <h3>Top 5 Best-Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topProducts}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie Chart: Orders Distribution */}
      {topProducts.length > 0 && (
        <div className={styles.chartContainer}>
          <h3>Orders Distribution (Top Products)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProducts}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {topProducts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line Chart: Revenue Trend */}
      {revenueTrend.length > 0 && (
        <div className={styles.chartContainer}>
          <h3>Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff7300"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default AdminOrderStats;
