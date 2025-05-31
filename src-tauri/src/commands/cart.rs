use tauri::{AppHandle, async_runtime::spawn_blocking};
use rusqlite::{Result, params};
use crate::{
    database::connection::establish_connection,
    database::cart::*,
};
use crate::models::{ Product, CartItem, CartInvoice, CartSummary, RecentInvoice };

#[tauri::command]
pub async fn fetch_cart_items(app: AppHandle, invoice_id: i32) -> Result<Vec<Product>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_cart_items(&conn, invoice_id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn add_cart_item(
    app: AppHandle,
    item: CartItem,
    invoice_type: String,
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        
        // Start transaction
        conn.execute("BEGIN", []).map_err(|e| e.to_string())?;

        // Insert cart item
        let result = insert_cart_item(&conn, &item).map_err(|e| e.to_string())?;

        // Update stock based on invoice type
        let qty_change = if invoice_type == "Sale" { -1.0 } else { 1.0 };
        conn.execute(
            "UPDATE stock SET qty = qty + ?1 WHERE id = ?2",
            params![qty_change, item.stock_id],
        ).map_err(|e| e.to_string())?;

        // Commit transaction
        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;

        Ok(result)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn update_cart_item_quantity(
    app: AppHandle,
    cart_item_id: i32,
    stock_id: i32,
    new_qty: f64,
    old_qty: f64,
    invoice_type: String,
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        
        // Start transaction
        conn.execute("BEGIN", []).map_err(|e| e.to_string())?;

        // Update cart item quantity
        conn.execute(
            "UPDATE cart SET qty = ?1 WHERE id = ?2",
            params![new_qty, cart_item_id],
        ).map_err(|e| e.to_string())?;

        // Update stock based on invoice type
        let qty_diff = if invoice_type == "Sale" {
            old_qty - new_qty
        } else {
            new_qty - old_qty
        };
        
        conn.execute(
            "UPDATE stock SET qty = qty + ?1 WHERE id = ?2",
            params![qty_diff, stock_id],
        ).map_err(|e| e.to_string())?;

        // Commit transaction
        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;

        Ok(1)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

// #[tauri::command]
// pub async fn remove_cart_item(
//     app: AppHandle,
//     cart_item_id: i32,
//     stock_id: i32,
//     qty: f64,
//     invoice_type: String,
// ) -> Result<usize, String> {
//     spawn_blocking(move || {
//         let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        
//         // Start transaction
//         conn.execute("BEGIN", []).map_err(|e| e.to_string())?;

//         // Delete cart item
//         let result = delete_cart_item(&conn, cart_item_id).map_err(|e| e.to_string())?;

//         // Update stock based on invoice type
//         let qty_change = if invoice_type == "Sale" { qty } else { -qty };
//         conn.execute(
//             "UPDATE stock SET qty = qty + ?1 WHERE id = ?2",
//             params![qty_change, stock_id],
//         ).map_err(|e| e.to_string())?;

//         // Commit transaction
//         conn.execute("COMMIT", []).map_err(|e| e.to_string())?;

//         Ok(result)
//     })
//     .await
//     .map_err(|e| format!("Task join error: {}", e))?
// }

#[tauri::command]
pub async fn remove_cart_item(app: AppHandle, cart_item_id: i32) -> Result<usize, String> {
    use rusqlite::params;

    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;

        // Start transaction
        conn.execute("BEGIN", []).map_err(|e| e.to_string())?;

        // Step 1: Get stock_id, qty, and invoice_id
        let mut stmt = conn
            .prepare("SELECT stock_id, qty, invoice_id FROM cart WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let cart_item = stmt
            .query_row(params![cart_item_id], |row| {
                Ok((
                    row.get::<_, i32>(0)?, // stock_id
                    row.get::<_, f64>(1)?, // qty
                    row.get::<_, i32>(2)?, // invoice_id
                ))
            })
            .map_err(|_| "Cart item not found".to_string())?;

        let (stock_id, qty, invoice_id) = cart_item;

        // Step 2: Get invoice type
        let mut stmt = conn
            .prepare("SELECT type FROM invoices WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let invoice_type: String = stmt
            .query_row(params![invoice_id], |row| row.get(0))
            .map_err(|_| "Invoice not found".to_string())?;

        // Step 3: Adjust stock based on invoice type
        let qty_change = if invoice_type == "Sale" {
            qty // add back to stock
        } else {
            -qty // subtract from stock
        };

        conn.execute(
            "UPDATE stock SET qty = qty + ?1 WHERE id = ?2",
            params![qty_change, stock_id],
        )
        .map_err(|e| e.to_string())?;

        // Step 4: Delete cart item
        conn.execute("DELETE FROM cart WHERE id = ?1", params![cart_item_id])
            .map_err(|e| e.to_string())?;

        // Commit transaction
        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;

        Ok(1)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}


#[tauri::command]
pub async fn create_new_invoice(
    app: AppHandle,
    invoice: CartInvoice,
) -> Result<i32, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        create_invoice(&conn, &invoice).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn update_invoice_details(
    app: AppHandle,
    invoice: CartInvoice,
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        update_invoice(&conn, &invoice).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn fetch_recent_invoices(app: AppHandle) -> Result<Vec<RecentInvoice>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_recent_invoices(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn calculate_cart_summary_command(
    app: AppHandle,
    invoice_id: i32,
) -> Result<CartSummary, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        calculate_cart_summary(&conn, invoice_id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn checkout_invoice(
    app: AppHandle,
    cart_items: Vec<Product>,
    invoice_type: String,
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        
        // Start transaction
        conn.execute("BEGIN", []).map_err(|e| e.to_string())?;

        // Update stock quantities based on invoice type
        for item in cart_items {
            let qty_change = if invoice_type == "Sale" {
                -item.qty
            } else {
                item.qty
            };
            
            conn.execute(
                "UPDATE stock SET qty = qty + ?1 WHERE id = ?2",
                params![qty_change, item.id],
            ).map_err(|e| e.to_string())?;
        }

        // Commit transaction
        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;

        Ok(1)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}