package com.kenshin.ai

import android.Manifest
import android.content.Intent
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import com.getcapacitor.*
import com.getcapacitor.annotation.*
import java.util.Locale

@CapacitorPlugin(
    name = "KenshinNative",
    permissions = [Permission(strings = [Manifest.permission.RECORD_AUDIO], alias = "microphone")]
)
class KenshinNativePlugin : Plugin(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    override fun load() { tts = TextToSpeech(context, this) }
    override fun onInit(status: Int) {
        ttsReady = status == TextToSpeech.SUCCESS
        if (ttsReady) tts?.language = Locale.getDefault()
    }
    @PluginMethod
    fun startVoiceInput(call: PluginCall) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "microphonePermissionResult"); return
        }
        launchSpeechRecognizer(call)
    }
    @PermissionCallback
    private fun microphonePermissionResult(call: PluginCall) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) launchSpeechRecognizer(call)
        else call.reject("Microphone permission was not granted.")
    }
    private fun launchSpeechRecognizer(call: PluginCall) {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag())
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to Kenshin")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        try { startActivityForResult(call, intent, "speechResult") }
        catch (_: Exception) { call.reject("Android speech recognition is not available on this device.") }
    }
    @ActivityCallback
    private fun speechResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        if (result.resultCode == android.app.Activity.RESULT_OK) {
            val phrase = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
            call.resolve(JSObject().put("text", phrase))
        } else call.resolve(JSObject().put("text", "").put("cancelled", true))
    }
    @PluginMethod
    fun speak(call: PluginCall) {
        val text = call.getString("text").orEmpty().take(4000)
        if (text.isBlank()) { call.reject("Text is empty."); return }
        if (!ttsReady) { call.reject("Android text-to-speech is not ready."); return }
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kenshin-" + System.currentTimeMillis())
        call.resolve()
    }
    @PluginMethod fun stopSpeaking(call: PluginCall) { tts?.stop(); call.resolve() }
    @PluginMethod
    fun openAccessibilitySettings(call: PluginCall) {
        val intent = Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent); call.resolve()
    }
    @PluginMethod
    fun getAccessibilityStatus(call: PluginCall) {
        call.resolve(JSObject().put("enabled", KenshinAccessibilityService.isEnabled(context)).put("serviceConnected", KenshinAccessibilityService.active != null))
    }
    @PluginMethod
    fun captureVisibleScreen(call: PluginCall) {
        val service = KenshinAccessibilityService.active
        if (service == null) { call.reject("Enable Kenshin Accessibility in Android Settings, then return and retry."); return }
        call.resolve(service.captureVisibleText())
    }
    @PluginMethod
    fun performScreenAction(call: PluginCall) {
        if (call.getBoolean("confirmed") != true) { call.reject("Action requires explicit confirmation in Kenshin."); return }
        val service = KenshinAccessibilityService.active
        if (service == null) { call.reject("Kenshin Accessibility is not enabled."); return }
        val action = call.getString("action").orEmpty()
        val result = service.performUserAction(action, call.getString("target").orEmpty())
        call.resolve(JSObject().put("performed", result).put("action", action))
    }
    override fun handleOnDestroy() {
        tts?.stop(); tts?.shutdown(); tts = null
        super.handleOnDestroy()
    }
}
