package com.kenshin.ai

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.provider.Settings
import android.text.TextUtils
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import com.getcapacitor.JSObject

class KenshinAccessibilityService : AccessibilityService() {
    companion object {
        @Volatile var active: KenshinAccessibilityService? = null
        fun isEnabled(context: Context): Boolean {
            val expected = context.packageName + "/" + KenshinAccessibilityService::class.java.name
            val enabled = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
            val splitter = TextUtils.SimpleStringSplitter(':')
            splitter.setString(enabled ?: "")
            while (splitter.hasNext()) if (splitter.next().equals(expected, ignoreCase = true)) return true
            return false
        }
    }
    override fun onServiceConnected() {
        super.onServiceConnected()
        active = this
        serviceInfo = serviceInfo.apply {
            flags = flags or AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        }
    }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) { /* No background collection; read only on request. */ }
    override fun onInterrupt() { }
    override fun onDestroy() { if (active === this) active = null; super.onDestroy() }

    fun captureVisibleText(): JSObject {
        val root = rootInActiveWindow
        val packageName = root?.packageName?.toString().orEmpty()
        val items = JSONArray()
        if (root != null) { appendVisibleNodes(root, items, 0); root.recycle() }
        return JSObject().put("packageName", packageName).put("items", items)
            .put("note", "Visible accessibility text only. No screenshots or background monitoring.")
    }
    private fun appendVisibleNodes(node: AccessibilityNodeInfo, items: JSONArray, depth: Int) {
        if (depth > 18 || items.length() >= 180) return
        if (node.isVisibleToUser) {
            val label = (node.text?.toString() ?: node.contentDescription?.toString()).orEmpty().trim()
            if (label.isNotBlank()) items.put(label.take(240))
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            appendVisibleNodes(child, items, depth + 1); child.recycle()
        }
    }
    fun performUserAction(action: String, target: String): Boolean {
        return when (action) {
            "back" -> performGlobalAction(GLOBAL_ACTION_BACK)
            "home" -> performGlobalAction(GLOBAL_ACTION_HOME)
            "click_text" -> clickText(rootInActiveWindow, target)
            "scroll_forward" -> scrollNode(rootInActiveWindow, AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)
            "scroll_backward" -> scrollNode(rootInActiveWindow, AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD)
            else -> false
        }
    }
    private fun clickText(node: AccessibilityNodeInfo?, target: String): Boolean {
        if (node == null || target.isBlank()) return false
        val wanted = target.trim().lowercase()
        val found = node.findAccessibilityNodeInfosByText(target).firstOrNull {
            it.isVisibleToUser && (it.text?.toString()?.lowercase()?.contains(wanted) == true ||
                it.contentDescription?.toString()?.lowercase()?.contains(wanted) == true)
        }
        var clicked = false
        if (found != null) {
            var current: AccessibilityNodeInfo? = found
            while (current != null && !clicked) {
                clicked = current.isClickable && current.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                current = if (!clicked) current.parent else null
            }
            found.recycle()
        }
        node.recycle()
        return clicked
    }
    private fun scrollNode(node: AccessibilityNodeInfo?, action: Int): Boolean {
        if (node == null) return false
        var result = node.isScrollable && node.performAction(action)
        if (!result) for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (child.isScrollable && child.performAction(action)) result = true
            child.recycle()
            if (result) break
        }
        node.recycle()
        return result
    }
}
