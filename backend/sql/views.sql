-- Analytical SQL View: Joins Customers and Orders
-- Normalizes net revenue according to business rules:
-- "Cancelled orders have a net amount of zero"
-- Preserves returned orders and extracts calendar fields for time-series analysis

DROP VIEW IF EXISTS v_sales_orders;

CREATE VIEW v_sales_orders AS
SELECT 
    o.Order_ID,
    o.Customer_ID,
    c.Customer_Name,
    c.Email,
    c.City,
    c.State,
    c.Customer_Segment,
    c.Acquisition_Channel,
    c.Join_Date,
    o.Order_Date,
    strftime('%Y-%m', o.Order_Date) AS Order_Year_Month,
    strftime('%Y', o.Order_Date) AS Order_Year,
    o.Product_ID,
    o.Product_Name,
    o.Category,
    o.Quantity,
    o.Unit_Price_INR,
    o.Discount_Rate,
    -- Enforce business rule: Cancelled orders have net amount of 0
    CASE 
        WHEN o.Order_Status = 'Cancelled' THEN 0.0 
        ELSE o.Net_Amount_INR 
    END AS Effective_Net_Amount_INR,
    o.Net_Amount_INR AS Raw_Net_Amount_INR,
    o.Payment_Method,
    o.Order_Status,
    -- Non-cancelled flag for Average Order Value calculation
    CASE 
        WHEN o.Order_Status != 'Cancelled' THEN 1 
        ELSE 0 
    END AS Is_Non_Cancelled
FROM orders o
INNER JOIN customers c ON o.Customer_ID = c.Customer_ID;
