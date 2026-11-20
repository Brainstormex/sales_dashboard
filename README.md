# Sales Analytics & Executive Dashboard

A production-grade, full-stack sales analytics dashboard built for the **Finance Department**. This application processes transactional sales and customer records from Excel files into a relational database, applies business accounting logic, exposes parameterized REST APIs, and provides a responsive, interactive **React.js (Vite)** dashboard.

---

## 🌟 Key Features & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js 18 + Vite** | Fast, responsive interface with interactive charts (Chart.js), dynamic filters, and KPI cards. |
| **Backend** | **Python (FastAPI)** | High-performance asynchronous REST API with Swagger/OpenAPI documentation (`/docs`). |
| **Database** | **SQLite (Relational)** | Enforces Primary Key (`Customer_ID`) and Foreign Key (`orders.Customer_ID`) referential integrity with cascading checks. |
| **ETL Pipeline** | **Python (openpyxl + stdlib)** | Parses Excel serial dates (`46023` → `2026-01-01`), validates records, and populates `sales.db`. |
| **Deployment** | **Docker & Docker Compose** | Single-command containerized deployment for both backend and frontend. |

---

## 📐 Project Directory Structure

```text
sales_dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI endpoints & CORS configuration
│   │   ├── database.py          # SQLite engine & connection lifecycle
│   │   ├── models.py            # Pydantic validation schemas
│   │   ├── services.py          # Parameterized SQL queries & business calculations
│   │   └── load_data.py         # ETL loader (Excel -> SQLite)
│   ├── sql/
│   │   ├── schema.sql           # DDL with Primary Key, Foreign Key & Indexes
│   │   └── views.sql            # Analytical View (v_sales_orders)
│   ├── sales.db                 # Relational SQLite database
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header with live status & ETL refresh trigger
│   │   │   ├── FilterBar.jsx    # Live date range, category, status & city filters
│   │   │   ├── KpiCard.jsx      # Metric cards with currency & percentage badges
│   │   │   └── Charts/
│   │   │       ├── RevenueTrendChart.jsx     # Monthly revenue gradient area chart
│   │   │       ├── CategoryRevenueChart.jsx  # Category revenue bar chart
│   │   │       ├── SegmentCityChart.jsx      # Segment vs City breakdown
│   │   │       ├── OrderStatusChart.jsx      # Fulfillment donut chart
│   │   │       └── TopProductsTable.jsx      # Top 5 bestsellers (Bonus)
│   │   ├── api.js               # Centralized Axios REST client
│   │   ├── App.jsx              # Main dashboard state & layout
│   │   ├── index.css            # Finance theme & typography
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Dockerfile.backend           # Python 3.11 container
├── Dockerfile.frontend          # Node.js + Nginx multi-stage container
├── docker-compose.yml           # Unified orchestration
└── README.md                    # Project documentation
```

---

## 💼 Business Rules & Metric Formulations

The business rules specified in the assignment are enforced across both the database view layer (`backend/sql/views.sql`) and query services (`backend/app/services.py`):

1. **Revenue Calculation**:
   - Uses `Net_Amount_INR`.
   - **Cancelled Orders**: Enforced to have `Effective_Net_Amount = 0.0`.
   $$\text{Total Net Revenue} = \sum_{\text{status} \ne \text{'Cancelled'}} \text{Net\_Amount\_INR}$$
2. **Order & Customer Counts**:
   - $\text{Total Orders} = \text{COUNT}(\text{DISTINCT Order\_ID})$
   - $\text{Unique Customers} = \text{COUNT}(\text{DISTINCT Customer\_ID})$
3. **Average Order Value (AOV)**:
   - Evaluated as Total Net Revenue divided exclusively by non-cancelled orders:
   $$\text{AOV} = \frac{\text{Total Net Revenue}}{\text{COUNT}(\text{DISTINCT non-cancelled Order\_ID})}$$
4. **Returned Orders**:
   - Kept in the dataset. Users can identify and audit them through the **Order Status Breakdown** donut chart and the **Order Status** filter.
5. **Bonus Metrics**:
   - **Top 5 Products**: Ranked by net revenue and units sold.
   - **Repeat Customer Rate**: Percentage of customers with $\ge 2$ orders:
   $$\text{Repeat Customer Rate} = \frac{\text{Customers with } \ge 2 \text{ orders}}{\text{Total Active Customers}} \times 100\%$$

---

## 🗄️ Database Schema & SQL View

### 1. Relational Schema (`schema.sql`)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE customers (
    Customer_ID TEXT PRIMARY KEY,
    Customer_Name TEXT NOT NULL,
    Email TEXT,
    City TEXT,
    State TEXT,
    Customer_Segment TEXT,
    Join_Date DATE,
    Acquisition_Channel TEXT
);

CREATE TABLE orders (
    Order_ID TEXT PRIMARY KEY,
    Customer_ID TEXT NOT NULL,
    Order_Date DATE NOT NULL,
    Product_ID TEXT NOT NULL,
    Product_Name TEXT NOT NULL,
    Category TEXT NOT NULL,
    Quantity INTEGER NOT NULL DEFAULT 1,
    Unit_Price_INR REAL NOT NULL DEFAULT 0.0,
    Discount_Rate REAL NOT NULL DEFAULT 0.0,
    Net_Amount_INR REAL NOT NULL DEFAULT 0.0,
    Payment_Method TEXT,
    Order_Status TEXT NOT NULL CHECK(Order_Status IN ('Completed', 'Returned', 'Cancelled')),
    FOREIGN KEY (Customer_ID) REFERENCES customers(Customer_ID) ON DELETE CASCADE
);
```

### 2. Analytical View (`views.sql`)
```sql
CREATE VIEW v_sales_orders AS
SELECT 
    o.Order_ID,
    o.Customer_ID,
    c.Customer_Name,
    c.City,
    c.State,
    c.Customer_Segment,
    o.Order_Date,
    strftime('%Y-%m', o.Order_Date) AS Order_Year_Month,
    o.Product_ID,
    o.Product_Name,
    o.Category,
    o.Quantity,
    CASE 
        WHEN o.Order_Status = 'Cancelled' THEN 0.0 
        ELSE o.Net_Amount_INR 
    END AS Effective_Net_Amount_INR,
    o.Payment_Method,
    o.Order_Status
FROM orders o
INNER JOIN customers c ON o.Customer_ID = c.Customer_ID;
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Install Python Dependencies & Load Data
From the project root:
```bash
pip install -r backend/requirements.txt
python backend/app/load_data.py
```
*Output will confirm: 60 customers and 240 orders inserted into `backend/sales.db`.*

---

### Step 2: Start the FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API is running at: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

---

### Step 3: Start the React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment (Optional Bonus)

Run the entire stack in isolated Docker containers:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API & Docs: `http://localhost:8000/docs`

To stop:
```bash
docker compose down
```

---

## 📊 Summary of Baseline Dataset Metrics

When no filters are applied, the system calculates:
- **Total Net Revenue**: ₹11,59,206.00
- **Total Orders**: 240 (164 Completed, 40 Returned, 36 Cancelled)
- **Non-Cancelled Orders**: 204
- **Unique Customers**: 59
- **Average Order Value (AOV)**: ₹5,682.38
- **Repeat Customer Rate**: 96.6% (57 repeat customers out of 59)
