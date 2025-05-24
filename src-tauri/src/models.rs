use serde::{Deserialize, Serialize};
use chrono::{NaiveDate, NaiveDateTime};
use rusqlite::Row;

#[derive(Debug, Serialize, Deserialize)]
pub struct Person {
    pub id: i32,
    pub name: String,
    pub role: String,
    pub contact: String,
    pub account: Option<String>,
    pub address: String,
    pub remarks: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub invoices_no: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewPerson {
    pub name: String,
    pub role: String,
    pub contact: String,
    pub account: Option<String>,
    pub address: String,
    pub remarks: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PersonInvoice {
    pub id: i32,
    pub invoice_no: String,
    pub r#type: String,
    pub date: String,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DropdownItem {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub rows_affected: usize,
    pub last_insert_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StockItem {
    pub id: Option<i32>,
    pub name: String,
    pub code: String,
    pub r#type: String,
    pub category: String,
    pub unit: String,
    pub qty: f64,
    pub min_qty: f64,
    pub target_qty: f64,
    pub sale_price: f64,
    pub purchase_price: f64,
    pub discount: f64,
    pub expiry: Option<NaiveDate>,
    pub location: String,
    pub remarks: String,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}


#[derive(Debug, Deserialize)]
pub struct StockItemImport {
    pub name: String,
    pub code: String,
    pub r#type: String,
    pub category: String,
    pub unit: String,
    pub qty: f64,
    pub min_qty: f64,
    pub target_qty: f64,
    pub sale_price: f64,
    pub purchase_price: f64,
    pub discount: f64,
    pub expiry: Option<String>,
    pub location: String,
    pub remarks: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StockStats {
    pub total_items_registered: i32,
    pub low_stock_items: i32,
    pub expired_items: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceCalculator {
    pub purchase_price: f64,
    pub sale_price: f64,
    pub purchase_factor: f64,
    pub sale_factor: f64,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: i32,
    pub code: String,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub qty: f64,
    pub price: f64,
    pub sale_price: f64,
    pub purchase_price: f64,
    pub location: String,
    pub min_qty: Option<f64>,
    pub expiry: Option<NaiveDate>,
    pub is_dangerous: Option<bool>,
    pub discount: Option<f64>,
    pub total: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartPerson {
    pub id: i32,
    pub name: String,
    pub contact: String,
    pub role: String,
    pub address: String,
    pub remarks: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartInvoice {
    pub id: Option<i32>,
    pub invoice_no: String,
    pub reference: String,
    #[serde(rename = "type")]
    pub invoice_type: String, // "Sale" or "Purchase"
    pub date: String,
    pub discount: f64,
    pub tax: f64,
    pub received: f64,
    pub remarks: String,
    pub person_id: i32,
    pub user_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentInvoice {
    pub id: i32,
    pub invoice_no: String,
    pub invoice_type: String,
    pub date: String,
    pub person: String,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Shop {
    pub id: i32,
    pub name: String,
    pub description: String,
    pub address: String,
    pub contact: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartItem {
    pub stock_id: i32,
    pub invoice_id: i32,
    pub qty: f64,
    pub price: f64,
    pub discount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartSummary {
    pub total: f64,
    pub discount: f64,
    pub tax: f64,
    pub net: f64,
    pub balance: f64,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShopSettings {
    pub id: Option<i32>,
    pub name: String,
    pub description: Option<String>,
    pub address: Option<String>,
    pub contact: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub image: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserSettings {
    pub id: Option<i32>,
    pub username: String,
    pub email: String,
    pub password: Option<String>,
    pub image: Option<String>,
    pub status: Option<i32>,
    pub person_id: Option<i32>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageUpload {
    pub file_name: String,
    pub base64_content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Option<i32>,
    pub username: String,
    pub email: String,
    pub password: Option<String>,
    pub image: Option<String>,
    pub first_login: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub success: bool,
    pub is_first_login: bool,
    pub user: Option<User>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Session {
    pub id: Option<i32>,
    pub user_id: i32,
    pub token: String,
    pub is_active: bool,
    pub created_at: Option<NaiveDateTime>,
}

// impl User {
//     pub fn from_row(row: &rusqlite::Row) -> rusqlite::Result<Self> {
//         Ok(Self {
//             id: row.get(0)?,
//             username: row.get(1)?,
//             email: row.get(2)?,
//             password: row.get(3)?,
//             image: row.get(4)?,
//             first_login: row.get(5)?,
//         })
//     }
// }

impl Session {
    pub fn from_row(row: &rusqlite::Row) -> rusqlite::Result<Self> {
        use chrono::NaiveDateTime;

        let created_at_str: Option<String> = row.get(4)?;
        let created_at = match created_at_str {
            Some(ref s) => NaiveDateTime::parse_from_str(s, "%Y-%m-%d %H:%M:%S").ok(),
            None => None,
        };

        Ok(Self {
            id: row.get(0)?,
            user_id: row.get(1)?,
            token: row.get(2)?,
            is_active: row.get(3)?,
            created_at,
        })
    }
}


#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub today_total_sale: f64,
    pub today_total_purchase: f64,
    pub this_month_total_sale: f64,
    pub this_month_total_purchase: f64,
    pub total_items_registered: i32,
    pub low_stock_items: i32,
    pub expired_items: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailyStat {
    pub date: String,
    pub sale: f64,
    pub purchase: f64,
}



#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterData {
    pub username: String,
    pub email: String,
    pub password: String,
    pub adminpassword: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterResponse {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<i64>,
}



#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterUser {
    pub id: Option<i32>,
    pub username: String,
    pub email: String,
    pub password: Option<String>,
    pub image: Option<String>,
    pub first_login: bool,
}

impl User {
    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password: row.get(3).ok(),
            image: row.get(4).ok(),
            first_login: row.get(5)?,
        })
    }
}
   



#[derive(Debug, Serialize, Deserialize)]
pub struct Invoice {
    pub id: Option<i32>,
    pub invoice_no: String,
    pub r#type: String,
    pub date: NaiveDate,
    pub person_id: i32,
    pub discount_amount: f64,
    pub tax_amount: f64,
    pub received: f64,
    pub user_id: i32,
    pub discount: f64,
    pub tax: f64,
    pub remarks: String,
    pub subtotal: Option<f64>,
    pub total: Option<f64>,
    pub items: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceItem {
    pub id: Option<i32>,
    pub invoice_id: Option<i32>,
    pub stock_id: Option<i32>,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub qty: f64,
    pub price: f64,
    pub discount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceWithItems {
    pub invoice: Invoice,
    pub items: Vec<InvoiceItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceStats {
    pub total_invoices: i32,
    pub total_sales: f64,
    pub total_purchases: f64,
}   