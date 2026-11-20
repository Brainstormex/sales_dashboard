-- Sales Dashboard Relational Schema
-- Enables foreign key constraints for SQLite
PRAGMA foreign_keys = ON;

-- 1. Customers Table (Dimension Table)
-- Customer_ID is the Primary Key
CREATE TABLE IF NOT EXISTS customers (
    Customer_ID TEXT PRIMARY KEY,
    Customer_Name TEXT NOT NULL,
    Email TEXT,
    City TEXT,
    State TEXT,
    Customer_Segment TEXT,
    Join_Date DATE,
    Acquisition_Channel TEXT
);

-- 2. Orders Table (Fact Table)
-- Order_ID is the Primary Key
-- Customer_ID is the Foreign Key referencing customers(Customer_ID)
CREATE TABLE IF NOT EXISTS orders (
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

-- Indexes for optimal analytical query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(Customer_ID);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(Order_Date);
CREATE INDEX IF NOT EXISTS idx_orders_category ON orders(Category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(Order_Status);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(City);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(Customer_Segment);
