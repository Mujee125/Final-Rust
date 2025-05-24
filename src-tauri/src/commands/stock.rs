use tauri::{AppHandle, async_runtime::spawn_blocking};
use rusqlite::Result;
use chrono::NaiveDate;  
use crate::models::{StockItem, StockStats,StockItemImport};
use crate::{
    database::connection::establish_connection,
    database::stock::{
        insert_stock, update_stock, delete_stock, 
        get_all_stock, get_stock_stats, upsert_stock
    }
};

#[tauri::command]
pub async fn fetch_stock_items(app: AppHandle) -> Result<Vec<StockItem>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_all_stock(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn fetch_stock_stats(app: AppHandle) -> Result<StockStats, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_stock_stats(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn save_stock_item(app: AppHandle, item: StockItem) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        if item.id.is_some() {
            update_stock(&conn, &item).map_err(|e| e.to_string())
        } else {
            insert_stock(&conn, &item).map_err(|e| e.to_string())
        }
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn delete_stock_item(app: AppHandle, id: i32) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        delete_stock(&conn, id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}



#[tauri::command]
pub async fn import_stock_items(
    app: AppHandle,
    items: Vec<StockItemImport>
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        let mut count = 0;
        
        for item in items {
            if item.name.is_empty() || item.code.is_empty() {
                continue;
            }

            // Parse expiry date if present
            let expiry = item.expiry.and_then(|e| {
                NaiveDate::parse_from_str(&e, "%Y-%m-%d").ok()
            });

            let stock_item = StockItem {
                id: None,
                name: item.name,
                code: item.code,
                r#type: item.r#type,
                category: item.category,
                unit: item.unit,
                qty: item.qty,
                min_qty: item.min_qty,
                target_qty: item.target_qty,
                sale_price: item.sale_price,
                purchase_price: item.purchase_price,
                discount: item.discount,
                expiry,
                location: item.location,
                remarks: item.remarks,
                created_at: None,
                updated_at: None,
            };

            if let Ok(n) = upsert_stock(&conn, &stock_item) {
                count += n;
            }
        }
        Ok(count)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

