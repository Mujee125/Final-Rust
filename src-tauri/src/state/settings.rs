// src/state/settings.rs
use tauri::{State, AppHandle};
use std::sync::Mutex;
use crate::models::{ShopSettings, UserSettings};
use crate::commands::settings::{get_shop_settings, get_user_settings};
#[derive(Debug, Default)]
pub struct SettingsState {
    pub shop: Mutex<Option<ShopSettings>>,
    pub user: Mutex<Option<UserSettings>>,
}

#[tauri::command]
pub async fn initialize_settings(
    app: AppHandle,
    state: State<'_, SettingsState>,
) -> Result<(), String> {
    let shop = get_shop_settings(app.clone()).await?;
    let user = get_user_settings(app).await?;

    if let Some(shop) = shop {
        *state.shop.lock().unwrap() = Some(shop);
    }
    
    if let Some(user) = user {
        *state.user.lock().unwrap() = Some(user);
    }

    Ok(())
}

#[tauri::command]
pub async fn get_current_shop_settings(
    state: State<'_, SettingsState>,
) -> Result<Option<ShopSettings>, String> {
    Ok(state.shop.lock().unwrap().clone())
}

#[tauri::command]
pub async fn get_current_user_settings(
    state: State<'_, SettingsState>,
) -> Result<Option<UserSettings>, String> {
    Ok(state.user.lock().unwrap().clone())
}