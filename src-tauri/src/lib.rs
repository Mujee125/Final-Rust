
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod models;
mod schema;
mod commands;
mod state;

use commands::person::*;
use commands::dropdown::*;
use commands::stock::*;
use commands::cart::*;
use commands::settings::*;
use commands::auth::*;
use commands::dashboard::*;
use commands::register::*;
use commands::invoice::*;

use tauri::{AppHandle, Manager};
use database::connection::{initialize_database, establish_connection};
use state::settings::*;
use std::sync::Mutex;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn initialize_db(app: AppHandle) -> Result<(), String> {
    initialize_database(&app).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle();
            // Initialize and manage settings state
            app.manage(SettingsState {
                shop: Mutex::new(None),
                user: Mutex::new(None),
            });

            // Initialize DB (create tables)
            initialize_database(&app_handle)?;

            // Establish and manage the database connection
            let conn = establish_connection(&app_handle)?;
            app.manage(Mutex::new(conn)); // << this registers the DB for use with `.state()`

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            initialize_db,

            // persons
            create_person,
            get_all_persons_command,
            get_invoices_by_person_id_command,
            update_person_command,
            delete_person_command,
            upsert_person_command,

            // dropdown
            fetch_dropdown_items,
            add_dropdown_item_command,
            update_dropdown_item_command,
            delete_dropdown_item_command,

            // stock
            fetch_stock_items,
            fetch_stock_stats,
            save_stock_item,
            delete_stock_item,
            import_stock_items,

            // cart 
            fetch_cart_items,
            add_cart_item,
            update_cart_item_quantity,
            remove_cart_item,
            create_new_invoice,
            update_invoice_details,
            fetch_recent_invoices,
            calculate_cart_summary_command,
            checkout_invoice,

            // Settings commands
            get_shop_settings,
            save_shop_settings,
            get_user_settings,
            save_user_settings,
            upload_image,
            initialize_settings,
            get_current_shop_settings,
            get_current_user_settings,

            // auth
            login,
            logout,
            load_session,

            // dashboard
            fetch_dashboard_stats,
            fetch_daily_stats,

            // register 
            register_user,
            reset_register,

            // invoice
            fetch_invoices,
            fetch_invoice_with_items,
            delete_invoice_cmd,
            
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
