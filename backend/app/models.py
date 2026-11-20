from pydantic import BaseModel
from typing import List, Optional

class KPIResponse(BaseModel):
    total_net_revenue: float
    total_orders: int
    unique_customers: int
    average_order_value: float
    repeat_customer_rate: float
    non_cancelled_orders: int

class MonthlyRevenueItem(BaseModel):
    year_month: str
    net_revenue: float
    order_count: int

class CategoryRevenueItem(BaseModel):
    category: str
    net_revenue: float
    order_count: int
    percentage: float

class SegmentRevenueItem(BaseModel):
    customer_segment: str
    net_revenue: float
    order_count: int

class CityRevenueItem(BaseModel):
    city: str
    net_revenue: float
    order_count: int

class OrderStatusItem(BaseModel):
    order_status: str
    count: int
    percentage: float
    total_net_revenue: float

class TopProductItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    total_revenue: float
    total_quantity: int
    order_count: int

class FilterOptionsResponse(BaseModel):
    min_date: Optional[str]
    max_date: Optional[str]
    categories: List[str]
    order_statuses: List[str]
    customer_segments: List[str]
    cities: List[str]
    payment_methods: List[str]
