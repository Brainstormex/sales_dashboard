from typing import List, Optional, Tuple, Dict, Any
from app.database import get_connection

def _is_valid_str(v) -> bool:
    return v is not None and isinstance(v, str) and v.strip() != ""

def _normalize_filter_list(v) -> List[str]:
    """Normalizes filter inputs whether given as a single string, comma-separated string, or list."""
    if v is None:
        return []
    if isinstance(v, str):
        return [p.strip() for p in v.split(",") if p.strip()]
    if isinstance(v, (list, tuple, set)):
        res = []
        for item in v:
            if isinstance(item, str):
                for p in item.split(","):
                    if p.strip():
                        res.append(p.strip())
            elif item is not None:
                res.append(str(item).strip())
        return res
    return []

def build_filter_clause(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[Any] = None,
    order_statuses: Optional[Any] = None,
    customer_segments: Optional[Any] = None,
    cities: Optional[Any] = None,
) -> Tuple[str, List[Any]]:
    """Builds a dynamic WHERE clause and parameter list from optional filter parameters."""
    conditions = []
    params: List[Any] = []

    if _is_valid_str(start_date):
        conditions.append("Order_Date >= ?")
        params.append(start_date.strip())

    if _is_valid_str(end_date):
        conditions.append("Order_Date <= ?")
        params.append(end_date.strip())

    valid_cats = _normalize_filter_list(categories)
    if valid_cats:
        placeholders = ",".join("?" for _ in valid_cats)
        conditions.append(f"Category IN ({placeholders})")
        params.extend(valid_cats)

    valid_statuses = _normalize_filter_list(order_statuses)
    if valid_statuses:
        placeholders = ",".join("?" for _ in valid_statuses)
        conditions.append(f"Order_Status IN ({placeholders})")
        params.extend(valid_statuses)

    valid_segs = _normalize_filter_list(customer_segments)
    if valid_segs:
        placeholders = ",".join("?" for _ in valid_segs)
        conditions.append(f"Customer_Segment IN ({placeholders})")
        params.extend(valid_segs)

    valid_cities = _normalize_filter_list(cities)
    if valid_cities:
        placeholders = ",".join("?" for _ in valid_cities)
        conditions.append(f"City IN ({placeholders})")
        params.extend(valid_cities)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    return where_clause, params

def get_filter_options() -> Dict[str, Any]:
    """Retrieves available distinct filter options from the database."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT MIN(Order_Date), MAX(Order_Date) FROM orders")
        min_date, max_date = cursor.fetchone()

        cursor.execute("SELECT DISTINCT Category FROM orders WHERE Category IS NOT NULL ORDER BY Category")
        categories = [r[0] for r in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Order_Status FROM orders WHERE Order_Status IS NOT NULL ORDER BY Order_Status")
        order_statuses = [r[0] for r in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Customer_Segment FROM customers WHERE Customer_Segment IS NOT NULL ORDER BY Customer_Segment")
        customer_segments = [r[0] for r in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT City FROM customers WHERE City IS NOT NULL ORDER BY City")
        cities = [r[0] for r in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Payment_Method FROM orders WHERE Payment_Method IS NOT NULL ORDER BY Payment_Method")
        payment_methods = [r[0] for r in cursor.fetchall()]

        return {
            "min_date": min_date,
            "max_date": max_date,
            "categories": categories,
            "order_statuses": order_statuses,
            "customer_segments": customer_segments,
            "cities": cities,
            "payment_methods": payment_methods,
        }
    finally:
        conn.close()

def get_kpis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[List[str]] = None,
    order_statuses: Optional[List[str]] = None,
    customer_segments: Optional[List[str]] = None,
    cities: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Calculates high-level KPIs based on the filtered view."""
    where_clause, params = build_filter_clause(
        start_date, end_date, categories, order_statuses, customer_segments, cities
    )
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Business Rules:
        # - Net revenue uses Effective_Net_Amount_INR (cancelled orders = 0)
        # - Total orders: COUNT(DISTINCT Order_ID)
        # - Unique customers: COUNT(DISTINCT Customer_ID)
        # - AOV: Total Net Revenue / non-cancelled orders
        query = f"""
            SELECT 
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS total_revenue,
                COUNT(DISTINCT Order_ID) AS total_orders,
                COUNT(DISTINCT Customer_ID) AS unique_customers,
                COUNT(DISTINCT CASE WHEN Order_Status != 'Cancelled' THEN Order_ID END) AS non_cancelled_orders
            FROM v_sales_orders
            {where_clause}
        """
        cursor.execute(query, params)
        row = cursor.fetchone()
        total_rev = float(row["total_revenue"])
        total_orders = int(row["total_orders"])
        unique_customers = int(row["unique_customers"])
        non_cancelled_orders = int(row["non_cancelled_orders"])
        
        aov = round(total_rev / non_cancelled_orders, 2) if non_cancelled_orders > 0 else 0.0

        # Repeat customer rate (Bonus): % of unique customers with > 1 order in filtered dataset
        repeat_query = f"""
            WITH customer_order_counts AS (
                SELECT Customer_ID, COUNT(DISTINCT Order_ID) as order_count
                FROM v_sales_orders
                {where_clause}
                GROUP BY Customer_ID
            )
            SELECT 
                COUNT(CASE WHEN order_count > 1 THEN 1 END) AS repeat_customers,
                COUNT(*) AS total_active_customers
            FROM customer_order_counts
        """
        cursor.execute(repeat_query, params)
        rep_row = cursor.fetchone()
        repeat_cust = rep_row["repeat_customers"] or 0
        total_active_cust = rep_row["total_active_customers"] or 0
        repeat_rate = round((repeat_cust / total_active_cust * 100), 1) if total_active_cust > 0 else 0.0

        return {
            "total_net_revenue": round(total_rev, 2),
            "total_orders": total_orders,
            "unique_customers": unique_customers,
            "average_order_value": aov,
            "repeat_customer_rate": repeat_rate,
            "non_cancelled_orders": non_cancelled_orders,
        }
    finally:
        conn.close()

def get_monthly_revenue_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[List[str]] = None,
    order_statuses: Optional[List[str]] = None,
    customer_segments: Optional[List[str]] = None,
    cities: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Retrieves monthly net revenue trend over time."""
    where_clause, params = build_filter_clause(
        start_date, end_date, categories, order_statuses, customer_segments, cities
    )
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = f"""
            SELECT 
                Order_Year_Month AS year_month,
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS net_revenue,
                COUNT(DISTINCT Order_ID) AS order_count
            FROM v_sales_orders
            {where_clause}
            GROUP BY Order_Year_Month
            ORDER BY Order_Year_Month ASC
        """
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [
            {
                "year_month": r["year_month"],
                "net_revenue": round(float(r["net_revenue"]), 2),
                "order_count": int(r["order_count"]),
            }
            for r in rows
        ]
    finally:
        conn.close()

def get_revenue_by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[List[str]] = None,
    order_statuses: Optional[List[str]] = None,
    customer_segments: Optional[List[str]] = None,
    cities: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Calculates revenue and order counts broken down by product category."""
    where_clause, params = build_filter_clause(
        start_date, end_date, categories, order_statuses, customer_segments, cities
    )
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = f"""
            SELECT 
                Category AS category,
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS net_revenue,
                COUNT(DISTINCT Order_ID) AS order_count
            FROM v_sales_orders
            {where_clause}
            GROUP BY Category
            ORDER BY net_revenue DESC
        """
        cursor.execute(query, params)
        rows = cursor.fetchall()
        total_rev = sum(float(r["net_revenue"]) for r in rows)
        
        return [
            {
                "category": r["category"],
                "net_revenue": round(float(r["net_revenue"]), 2),
                "order_count": int(r["order_count"]),
                "percentage": round((float(r["net_revenue"]) / total_rev * 100), 1) if total_rev > 0 else 0.0,
            }
            for r in rows
        ]
    finally:
        conn.close()

def get_revenue_by_segment_and_city(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[List[str]] = None,
    order_statuses: Optional[List[str]] = None,
    customer_segments: Optional[List[str]] = None,
    cities: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Retrieves revenue breakdown by customer segment and city."""
    where_clause, params = build_filter_clause(
        start_date, end_date, categories, order_statuses, customer_segments, cities
    )
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # By Customer Segment
        seg_query = f"""
            SELECT 
                Customer_Segment AS customer_segment,
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS net_revenue,
                COUNT(DISTINCT Order_ID) AS order_count
            FROM v_sales_orders
            {where_clause}
            GROUP BY Customer_Segment
            ORDER BY net_revenue DESC
        """
        cursor.execute(seg_query, params)
        segments = [
            {
                "customer_segment": r["customer_segment"],
                "net_revenue": round(float(r["net_revenue"]), 2),
                "order_count": int(r["order_count"]),
            }
            for r in cursor.fetchall()
        ]

        # By City
        city_query = f"""
            SELECT 
                City AS city,
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS net_revenue,
                COUNT(DISTINCT Order_ID) AS order_count
            FROM v_sales_orders
            {where_clause}
            GROUP BY City
            ORDER BY net_revenue DESC
        """
        cursor.execute(city_query, params)
        cities_data = [
            {
                "city": r["city"],
                "net_revenue": round(float(r["net_revenue"]), 2),
                "order_count": int(r["order_count"]),
            }
            for r in cursor.fetchall()
        ]

        return {
            "by_segment": segments,
            "by_city": cities_data,
        }
    finally:
        conn.close()

def get_order_status_distribution(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[List[str]] = None,
    order_statuses: Optional[List[str]] = None,
    customer_segments: Optional[List[str]] = None,
    cities: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Calculates order counts and percentages by status (Completed, Returned, Cancelled)."""
    where_clause, params = build_filter_clause(
        start_date, end_date, categories, order_statuses, customer_segments, cities
    )
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = f"""
            SELECT 
                Order_Status AS order_status,
                COUNT(DISTINCT Order_ID) AS count,
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS total_net_revenue
            FROM v_sales_orders
            {where_clause}
            GROUP BY Order_Status
            ORDER BY count DESC
        """
        cursor.execute(query, params)
        rows = cursor.fetchall()
        total_count = sum(int(r["count"]) for r in rows)

        return [
            {
                "order_status": r["order_status"],
                "count": int(r["count"]),
                "percentage": round((int(r["count"]) / total_count * 100), 1) if total_count > 0 else 0.0,
                "total_net_revenue": round(float(r["total_net_revenue"]), 2),
            }
            for r in rows
        ]
    finally:
        conn.close()

def get_top_products(
    limit: int = 5,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[List[str]] = None,
    order_statuses: Optional[List[str]] = None,
    customer_segments: Optional[List[str]] = None,
    cities: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Bonus: Retrieves top N products by total net revenue and quantity sold."""
    where_clause, params = build_filter_clause(
        start_date, end_date, categories, order_statuses, customer_segments, cities
    )
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = f"""
            SELECT 
                Product_ID AS product_id,
                Product_Name AS product_name,
                Category AS category,
                COALESCE(SUM(Effective_Net_Amount_INR), 0.0) AS total_revenue,
                COALESCE(SUM(Quantity), 0) AS total_quantity,
                COUNT(DISTINCT Order_ID) AS order_count
            FROM v_sales_orders
            {where_clause}
            GROUP BY Product_ID, Product_Name, Category
            ORDER BY total_revenue DESC
            LIMIT ?
        """
        params_with_limit = params + [limit]
        cursor.execute(query, params_with_limit)
        rows = cursor.fetchall()
        return [
            {
                "product_id": r["product_id"],
                "product_name": r["product_name"],
                "category": r["category"],
                "total_revenue": round(float(r["total_revenue"]), 2),
                "total_quantity": int(r["total_quantity"]),
                "order_count": int(r["order_count"]),
            }
            for r in rows
        ]
    finally:
        conn.close()
