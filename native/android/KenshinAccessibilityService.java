package com.kenshin.ai;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Context;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import com.getcapacitor.JSObject;
import org.json.JSONArray;

public class KenshinAccessibilityService extends AccessibilityService {
    public static volatile KenshinAccessibilityService active;

    public static boolean isEnabled(Context context) {
        String expected = context.getPackageName() + "/" + KenshinAccessibilityService.class.getName();
        String enabled = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
        splitter.setString(enabled == null ? "" : enabled);
        while (splitter.hasNext()) if (splitter.next().equalsIgnoreCase(expected)) return true;
        return false;
    }
    @Override protected void onServiceConnected() {
        super.onServiceConnected();
        active = this;
        AccessibilityServiceInfo info = getServiceInfo();
        if (info != null) {
            info.flags |= AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS | AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
            info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED | AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
            info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
            setServiceInfo(info);
        }
    }
    @Override public void onAccessibilityEvent(AccessibilityEvent event) { /* No background collection. */ }
    @Override public void onInterrupt() { }
    @Override public void onDestroy() {
        if (active == this) active = null;
        super.onDestroy();
    }

    public JSObject captureVisibleText() {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        String packageName = root == null || root.getPackageName() == null ? "" : root.getPackageName().toString();
        JSONArray items = new JSONArray();
        if (root != null) { appendVisibleNodes(root, items, 0); root.recycle(); }
        return new JSObject().put("packageName", packageName).put("items", items)
            .put("note", "Visible accessibility text only. No screenshots or background monitoring.");
    }
    private void appendVisibleNodes(AccessibilityNodeInfo node, JSONArray items, int depth) {
        if (depth > 18 || items.length() >= 180) return;
        if (node.isVisibleToUser()) {
            CharSequence raw = node.getText() != null ? node.getText() : node.getContentDescription();
            String label = raw == null ? "" : raw.toString().trim();
            if (!label.isEmpty()) items.put(label.substring(0, Math.min(label.length(), 240)));
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) { appendVisibleNodes(child, items, depth + 1); child.recycle(); }
        }
    }
    public boolean performUserAction(String action, String target) {
        if ("back".equals(action)) return performGlobalAction(GLOBAL_ACTION_BACK);
        if ("home".equals(action)) return performGlobalAction(GLOBAL_ACTION_HOME);
        if ("click_text".equals(action)) return clickText(getRootInActiveWindow(), target);
        if ("launch_app".equals(action)) return launchApp(target);
        if ("scroll_forward".equals(action)) return scrollNode(getRootInActiveWindow(), AccessibilityNodeInfo.ACTION_SCROLL_FORWARD);
        if ("scroll_backward".equals(action)) return scrollNode(getRootInActiveWindow(), AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
        return false;
    }
    private boolean launchApp(String query) {
        if (query == null || query.trim().isEmpty()) return false;
        android.content.pm.PackageManager pm = getPackageManager();
        String wanted = query.trim().toLowerCase();
        for (android.content.pm.ApplicationInfo app : pm.getInstalledApplications(android.content.pm.PackageManager.GET_META_DATA)) {
            String label = pm.getApplicationLabel(app).toString().toLowerCase();
            if (label.contains(wanted) || app.packageName.equalsIgnoreCase(wanted)) {
                android.content.Intent intent = pm.getLaunchIntentForPackage(app.packageName);
                if (intent != null) {
                    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    try { startActivity(intent); return true; } catch (Exception ignored) { return false; }
                }
            }
        }
        return false;
    }
    private boolean clickText(AccessibilityNodeInfo root, String target) {
        if (root == null || target == null || target.trim().isEmpty()) return false;
        java.util.List<AccessibilityNodeInfo> foundNodes = root.findAccessibilityNodeInfosByText(target);
        boolean clicked = false;
        if (foundNodes != null) for (AccessibilityNodeInfo found : foundNodes) {
            if (!found.isVisibleToUser()) { found.recycle(); continue; }
            AccessibilityNodeInfo current = found;
            while (current != null && !clicked) {
                clicked = current.isClickable() && current.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                AccessibilityNodeInfo parent = clicked ? null : current.getParent();
                if (current != found) current.recycle();
                current = parent;
            }
            found.recycle();
            if (clicked) break;
        }
        root.recycle();
        return clicked;
    }
    private boolean scrollNode(AccessibilityNodeInfo root, int action) {
        if (root == null) return false;
        boolean result = root.isScrollable() && root.performAction(action);
        if (!result) for (int i = 0; i < root.getChildCount(); i++) {
            AccessibilityNodeInfo child = root.getChild(i);
            if (child == null) continue;
            result = child.isScrollable() && child.performAction(action);
            child.recycle();
            if (result) break;
        }
        root.recycle();
        return result;
    }
}
