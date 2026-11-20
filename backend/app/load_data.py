import os
import sys
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
import zipfile
import xml.etree.ElementTree as ET

# Ensure parent path is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = BASE_DIR.parent
sys.path.append(str(BASE_DIR))

from app.database import get_connection, init_db, DB_PATH

def excel_serial_to_date_str(val) -> str:
    """Converts Excel serial dates (e.g. 45818, 46023) or date strings to ISO YYYY-MM-DD."""
    if val is None or val == '':
        return None
    if isinstance(val, (int, float)):
        # Excel epoch: Dec 30, 1899 (handles 1900 leap year bug)
        dt = datetime(1899, 12, 30) + timedelta(days=float(val))
        return dt.strftime('%Y-%m-%d')
    s = str(val).strip()
    try:
        f = float(s)
        dt = datetime(1899, 12, 30) + timedelta(days=f)
        return dt.strftime('%Y-%m-%d')
    except ValueError:
        # If already formatted string
        if "T" in s:
            return s.split("T")[0]
        if " " in s:
            return s.split(" ")[0]
        return s[:10]

def read_xlsx(file_path):
    """
    Reads an XLSX file using openpyxl if available, otherwise falls back to
    Python's standard library zipfile + xml.etree.ElementTree for 100% reliability.
    Returns list of dicts.
    """
    try:
        import openpyxl
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active
        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            return []
        headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(rows[0])]
        data = []
        for row in rows[1:]:
            if all(v is None for v in row):
                continue
            item = {}
            for h, v in zip(headers, row):
                item[h] = v
            data.append(item)
        return data
    except ImportError:
        # Fallback to standard library parser
        with zipfile.ZipFile(file_path) as z:
            ss = []
            if 'xl/sharedStrings.xml' in z.namelist():
                tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
                for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    text = ''.join(t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'))
                    ss.append(text)
            
            sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
            rows_xml = sheet.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
            if not rows_xml:
                return []
            
            raw_rows = []
            for r in rows_xml:
                row_vals = []
                for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    t = c.get('t')
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v.text if v is not None else ''
                    if t == 's' and val.isdigit():
                        val = ss[int(val)]
                    row_vals.append(val)
                raw_rows.append(row_vals)
            
            headers = raw_rows[0]
            data = []
            for row in raw_rows[1:]:
                item = {headers[i]: row[i] if i < len(row) else None for i in range(len(headers))}
                data.append(item)
            return data

def find_file(candidates):
    """Searches project directory and root directory for candidate filenames."""
    search_dirs = [PROJECT_DIR, BASE_DIR, PROJECT_DIR / "data"]
    for d in search_dirs:
        for fname in candidates:
            p = d / fname
            if p.exists():
                return p
    return None

def load_all_data():
    """Initializes database schema and loads customers and orders data."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    cust_path = find_file(["customers (1).xlsx", "customers.xlsx"])
    orders_path = find_file(["orders.xlsx"])

    if not cust_path:
        raise FileNotFoundError("Could not find customers Excel file in project directory.")
    if not orders_path:
        raise FileNotFoundError("Could not find orders.xlsx in project directory.")

    print(f"Loading customers from: {cust_path.name}")
    customers = read_xlsx(cust_path)

    print(f"Loading orders from: {orders_path.name}")
    orders = read_xlsx(orders_path)

    # Clean existing data to ensure idempotent runs
    cursor.execute("DELETE FROM orders;")
    cursor.execute("DELETE FROM customers;")

    # Insert Customers
    inserted_cust = 0
    for c in customers:
        cid = str(c.get('Customer_ID', '')).strip()
        if not cid:
            continue
        cname = str(c.get('Customer_Name', '')).strip()
        email = str(c.get('Email', '')).strip() if c.get('Email') else None
        city = str(c.get('City', '')).strip() if c.get('City') else None
        state = str(c.get('State', '')).strip() if c.get('State') else None
        segment = str(c.get('Customer_Segment', '')).strip() if c.get('Customer_Segment') else None
        join_date = excel_serial_to_date_str(c.get('Join_Date'))
        channel = str(c.get('Acquisition_Channel', '')).strip() if c.get('Acquisition_Channel') else None

        cursor.execute("""
            INSERT INTO customers (
                Customer_ID, Customer_Name, Email, City, State, 
                Customer_Segment, Join_Date, Acquisition_Channel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (cid, cname, email, city, state, segment, join_date, channel))
        inserted_cust += 1

    # Insert Orders
    inserted_orders = 0
    for o in orders:
        oid = str(o.get('Order_ID', '')).strip()
        if not oid:
            continue
        cid = str(o.get('Customer_ID', '')).strip()
        order_date = excel_serial_to_date_str(o.get('Order_Date'))
        pid = str(o.get('Product_ID', '')).strip()
        pname = str(o.get('Product_Name', '')).strip()
        cat = str(o.get('Category', '')).strip()
        
        try:
            qty = int(float(o.get('Quantity', 1)))
        except (ValueError, TypeError):
            qty = 1
            
        try:
            unit_price = float(o.get('Unit_Price_INR', 0.0))
        except (ValueError, TypeError):
            unit_price = 0.0
            
        try:
            discount = float(o.get('Discount_Rate', 0.0))
        except (ValueError, TypeError):
            discount = 0.0
            
        try:
            net_amt = float(o.get('Net_Amount_INR', 0.0))
        except (ValueError, TypeError):
            net_amt = 0.0

        pay_method = str(o.get('Payment_Method', '')).strip() if o.get('Payment_Method') else None
        status = str(o.get('Order_Status', 'Completed')).strip()

        # Business Rule: Cancelled orders have a net amount of zero
        if status.lower() == 'cancelled':
            net_amt = 0.0

        cursor.execute("""
            INSERT INTO orders (
                Order_ID, Customer_ID, Order_Date, Product_ID, Product_Name,
                Category, Quantity, Unit_Price_INR, Discount_Rate, Net_Amount_INR,
                Payment_Method, Order_Status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (oid, cid, order_date, pid, pname, cat, qty, unit_price, discount, net_amt, pay_method, status))
        inserted_orders += 1

    conn.commit()
    conn.close()

    print(f"Data loading complete!")
    print(f"-> Successfully inserted {inserted_cust} customers.")
    print(f"-> Successfully inserted {inserted_orders} orders.")

if __name__ == "__main__":
    load_all_data()
