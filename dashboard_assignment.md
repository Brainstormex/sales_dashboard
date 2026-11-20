# Assignment: Sales Dashboard Using Excel Data and a Database

## Objective

Build a simple interactive sales dashboard using the two Excel files provided. Load both files into a database, join them correctly, and use the combined data to create the dashboard.

## Files provided

1. `customers.xlsx` — one row per customer
2. `orders.xlsx` — one row per order

The files are related through `Customer_ID`:

- `customers.Customer_ID` is the primary key.
- `orders.Customer_ID` is the foreign key.
- One customer can have many orders.

## Candidate tasks

1. Create two database tables and load the Excel data into them.
2. Define suitable column data types, a primary key, and the customer-to-orders relationship.
3. Write a query or database view that joins customers and orders using `Customer_ID`.
4. Connect a dashboard tool of your choice to the database. Examples: Power BI, Tableau, Looker Studio, Metabase, or a simple web dashboard.
5. Build one dashboard page containing:
   - Total net revenue
   - Total orders
   - Unique customers
   - Average order value
   - Monthly revenue trend
   - Revenue by product category
   - Revenue by customer segment or city
   - Order count by order status
6. Add at least two filters, such as date range, product category, customer segment, city, or order status.

## Business rules

- Use `Net_Amount_INR` for revenue.
- Cancelled orders have a net amount of zero.
- Count each unique `Order_ID` as one order.
- Count each unique `Customer_ID` as one customer.
- Average order value = total net revenue divided by the number of non-cancelled orders.
- Returned orders remain in the data. The dashboard should allow users to identify them by status.

## Expected submission

- Database schema or table-creation SQL
- Data-loading script or clear loading steps
- SQL query or view used for the joined dataset
- Dashboard file or accessible dashboard link
- A short README containing setup steps, tools used, and any assumptions

## Suggested time

3 to 4 hours

## Evaluation criteria

| Area | Weight |
|---|---:|
| Correct data loading and table relationships | 25% |
| SQL join and metric accuracy | 25% |
| Dashboard clarity and required visuals | 25% |
| Filters and usability | 15% |
| Code organization and README | 10% |

## Optional bonus

- Add a top-five-products view.
- Add a repeat-customer metric.
- Dockerize the database and dashboard setup.
