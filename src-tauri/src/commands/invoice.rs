use tauri::{AppHandle, async_runtime::spawn_blocking};
use rusqlite::Result;
use crate::{
    database::{connection::establish_connection, invoice::{delete_invoice, get_all_invoices, get_invoice_by_id, get_invoice_items_by_invoice_id}},
    models::{FullInvoice, Invoice, InvoiceItem}
};

#[tauri::command]
pub async fn fetch_invoices(app: AppHandle) -> Result<Vec<Invoice>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_all_invoices(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn fetch_invoice_with_items(
    app: AppHandle,
    id: i32
) -> Result<FullInvoice, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_invoice_by_id(&conn, id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
} 

#[tauri::command]
pub async fn fetch_invoice_with_items_for_invoice(
    app: AppHandle,
    id: i32
) -> Result<serde_json::Value, String> {
    use serde_json::json;
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        let full_invoice = get_invoice_by_id(&conn, id).map_err(|e| e.to_string())?;
        // Split into invoice and items
        let items = full_invoice.items.clone();
        let mut invoice = full_invoice;
        invoice.items = vec![]; // Remove items from invoice
        Ok(json!({
            "invoice": invoice,
            "items": items
        }))
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
 

#[tauri::command]
pub async fn fetch_invoice_detail_by_id(
    app: AppHandle,
    id: i32
) -> Result<Vec<InvoiceItem>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_invoice_items_by_invoice_id(&conn, id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}


#[tauri::command]
pub async fn delete_invoice_cmd(
    app: AppHandle,
    id: i32
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        delete_invoice(&conn, id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}