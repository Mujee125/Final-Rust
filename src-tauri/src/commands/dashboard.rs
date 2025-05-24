// src/commands/dashboard.rs
use tauri::{AppHandle, async_runtime::spawn_blocking, Manager};
use rusqlite::Connection;
use crate::{
    models::{DashboardStats, DailyStat},
    database::dashboard::DashboardDatabase,
};
use std::sync::Mutex;

#[tauri::command]
pub async fn fetch_dashboard_stats(
    app: AppHandle,
) -> Result<DashboardStats, String> {
    spawn_blocking(move || {
        let conn = app.state::<Mutex<Connection>>();
        let conn = conn.lock().unwrap();
        let dashboard_db = DashboardDatabase::new(&conn);
        
        dashboard_db.get_dashboard_stats()
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn fetch_daily_stats(
    app: AppHandle,
) -> Result<Vec<DailyStat>, String> {
    spawn_blocking(move || {
        let conn = app.state::<Mutex<Connection>>();
        let conn = conn.lock().unwrap();
        let dashboard_db = DashboardDatabase::new(&conn);
        
        dashboard_db.get_daily_stats()
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}