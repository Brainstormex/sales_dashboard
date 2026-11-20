from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from pathlib import Path
import sys

# Ensure backend root is on path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from app.database import init_db
from app.load_data import load_all_data
from app.models import (
    KPIResponse, MonthlyRevenueItem, CategoryRevenueItem, 
    OrderStatusItem, TopProductItem, FilterOptionsResponse
)
from app.services import (
    get_filter_options, get_kpis, get_monthly_revenue_trend,
    get_revenue_by_category, get_revenue_by_segment_and_city,
    get_order_status_distribution, get_top_products
)

app = FastAPI(
    title="Finance - Sales Analytics & Dashboard API",
    description="Production-grade REST API powering the Finance Department Sales Dashboard.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite defaults to localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_filter_param(request: Request, key: str, fallback_val: Any = None) -> List[str]:
    """
    Extracts query parameter values whether passed as:
    - ?category=Electronics
    - ?category[]=Electronics
    - ?category=Electronics&category=Office
    - Or fallback value from FastAPI Query parameter.
    """
    vals = request.query_params.getlist(key)
    if not vals:
        vals = request.query_params.getlist(f"{key}[]")
    
    if not vals and fallback_val is not None:
        if isinstance(fallback_val, list):
            vals = fallback_val
        elif isinstance(fallback_val, str):
            vals = [fallback_val]
            
    # Clean and split if comma-separated
    result = []
    for v in vals:
        if isinstance(v, str):
            for part in v.split(","):
                if part.strip():
                    result.append(part.strip())
        elif v is not None:
            result.append(str(v).strip())
    return result

@app.on_event("startup")
def startup_event():
    """Ensure database exists on startup."""
    init_db()

@app.get("/", tags=["Health & Info"])
def root():
    return {
        "status": "online",
        "service": "Finance Sales Analytics API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/filters", response_model=FilterOptionsResponse, tags=["Metadata"])
def filter_options():
    """Returns available distinct filter values for dynamic dropdowns."""
    return get_filter_options()

@app.get("/api/kpis", response_model=KPIResponse, tags=["Analytics"])
def kpis(
    request: Request,
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    order_status: Optional[List[str]] = Query(default=None),
    customer_segment: Optional[List[str]] = Query(default=None),
    city: Optional[List[str]] = Query(default=None),
):
    """Returns summary KPIs (Net Revenue, Total Orders, Unique Customers, AOV, Repeat Rate)."""
    s_date = request.query_params.get("start_date") or start_date
    e_date = request.query_params.get("end_date") or end_date
    return get_kpis(
        start_date=s_date,
        end_date=e_date,
        categories=extract_filter_param(request, "category", category),
        order_statuses=extract_filter_param(request, "order_status", order_status),
        customer_segments=extract_filter_param(request, "customer_segment", customer_segment),
        cities=extract_filter_param(request, "city", city),
    )

@app.get("/api/charts/monthly-revenue", response_model=List[MonthlyRevenueItem], tags=["Visualizations"])
def monthly_revenue(
    request: Request,
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    order_status: Optional[List[str]] = Query(default=None),
    customer_segment: Optional[List[str]] = Query(default=None),
    city: Optional[List[str]] = Query(default=None),
):
    """Returns monthly revenue trend data."""
    s_date = request.query_params.get("start_date") or start_date
    e_date = request.query_params.get("end_date") or end_date
    return get_monthly_revenue_trend(
        start_date=s_date,
        end_date=e_date,
        categories=extract_filter_param(request, "category", category),
        order_statuses=extract_filter_param(request, "order_status", order_status),
        customer_segments=extract_filter_param(request, "customer_segment", customer_segment),
        cities=extract_filter_param(request, "city", city),
    )

@app.get("/api/charts/category-revenue", response_model=List[CategoryRevenueItem], tags=["Visualizations"])
def category_revenue(
    request: Request,
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    order_status: Optional[List[str]] = Query(default=None),
    customer_segment: Optional[List[str]] = Query(default=None),
    city: Optional[List[str]] = Query(default=None),
):
    """Returns revenue breakdown across product categories."""
    s_date = request.query_params.get("start_date") or start_date
    e_date = request.query_params.get("end_date") or end_date
    return get_revenue_by_category(
        start_date=s_date,
        end_date=e_date,
        categories=extract_filter_param(request, "category", category),
        order_statuses=extract_filter_param(request, "order_status", order_status),
        customer_segments=extract_filter_param(request, "customer_segment", customer_segment),
        cities=extract_filter_param(request, "city", city),
    )

@app.get("/api/charts/segment-city", tags=["Visualizations"])
def segment_city_revenue(
    request: Request,
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    order_status: Optional[List[str]] = Query(default=None),
    customer_segment: Optional[List[str]] = Query(default=None),
    city: Optional[List[str]] = Query(default=None),
):
    """Returns revenue split across customer segments and cities."""
    s_date = request.query_params.get("start_date") or start_date
    e_date = request.query_params.get("end_date") or end_date
    return get_revenue_by_segment_and_city(
        start_date=s_date,
        end_date=e_date,
        categories=extract_filter_param(request, "category", category),
        order_statuses=extract_filter_param(request, "order_status", order_status),
        customer_segments=extract_filter_param(request, "customer_segment", customer_segment),
        cities=extract_filter_param(request, "city", city),
    )

@app.get("/api/charts/order-status", response_model=List[OrderStatusItem], tags=["Visualizations"])
def order_status_distribution(
    request: Request,
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    order_status: Optional[List[str]] = Query(default=None),
    customer_segment: Optional[List[str]] = Query(default=None),
    city: Optional[List[str]] = Query(default=None),
):
    """Returns distribution of orders by status (Completed, Returned, Cancelled)."""
    s_date = request.query_params.get("start_date") or start_date
    e_date = request.query_params.get("end_date") or end_date
    return get_order_status_distribution(
        start_date=s_date,
        end_date=e_date,
        categories=extract_filter_param(request, "category", category),
        order_statuses=extract_filter_param(request, "order_status", order_status),
        customer_segments=extract_filter_param(request, "customer_segment", customer_segment),
        cities=extract_filter_param(request, "city", city),
    )

@app.get("/api/charts/top-products", response_model=List[TopProductItem], tags=["Visualizations"])
def top_products(
    request: Request,
    limit: int = Query(default=5, ge=1, le=20),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    order_status: Optional[List[str]] = Query(default=None),
    customer_segment: Optional[List[str]] = Query(default=None),
    city: Optional[List[str]] = Query(default=None),
):
    """Bonus: Returns top products by total revenue."""
    actual_limit = limit if isinstance(limit, int) else 5
    s_date = request.query_params.get("start_date") or start_date
    e_date = request.query_params.get("end_date") or end_date
    return get_top_products(
        limit=actual_limit,
        start_date=s_date,
        end_date=e_date,
        categories=extract_filter_param(request, "category", category),
        order_statuses=extract_filter_param(request, "order_status", order_status),
        customer_segments=extract_filter_param(request, "customer_segment", customer_segment),
        cities=extract_filter_param(request, "city", city),
    )

@app.post("/api/reload-data", tags=["Admin / ETL"])
def reload_data():
    """Trigger manual reload of Excel files into SQLite."""
    try:
        load_all_data()
        return {"status": "success", "message": "Data successfully reloaded from Excel files."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
