use tauri::{AppHandle, async_runtime::spawn_blocking};
use rusqlite::Result;
use crate::{
    database::connection::establish_connection,
    database::invoice::{get_all_invoices, get_invoice_with_items, delete_invoice},
    models::{Invoice, InvoiceWithItems}
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
) -> Result<InvoiceWithItems, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_invoice_with_items(&conn, id).map_err(|e| e.to_string())
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