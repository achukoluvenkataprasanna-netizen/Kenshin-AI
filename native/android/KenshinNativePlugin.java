package com.kenshin.ai;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PluginMethod;
import java.util.ArrayList;
import java.util.Locale;

@CapacitorPlugin(name = "KenshinNative", permissions = {
    @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
})
public class KenshinNativePlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override public void load() { tts = new TextToSpeech(getContext(), this); }
    @Override public void onInit(int status) {
        ttsReady = status == TextToSpeech.SUCCESS;
        if (ttsReady) tts.setLanguage(Locale.getDefault());
    }

    @PluginMethod public void startVoiceInput(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "microphonePermissionResult");
            return;
        }
        launchSpeechRecognizer(call);
    }
    @PermissionCallback private void microphonePermissionResult(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) launchSpeechRecognizer(call);
        else call.reject("Microphone permission was not granted.");
    }
    private void launchSpeechRecognizer(PluginCall call) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag());
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to Kenshin");
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        try { startActivityForResult(call, intent, "speechResult"); }
        catch (Exception e) { call.reject("Android speech recognition is not available on this device."); }
    }
    @ActivityCallback private void speechResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() == Activity.RESULT_OK) {
            ArrayList<String> matches = result.getData() == null ? null :
                result.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            call.resolve(new JSObject().put("text", matches == null || matches.isEmpty() ? "" : matches.get(0)));
        } else call.resolve(new JSObject().put("text", "").put("cancelled", true));
    }

    @PluginMethod public void speak(PluginCall call) {
        String text = call.getString("text", "").trim();
        if (text.isEmpty()) { call.reject("Text is empty."); return; }
        if (!ttsReady) { call.reject("Android text-to-speech is not ready."); return; }
        tts.speak(text.substring(0, Math.min(text.length(), 4000)), TextToSpeech.QUEUE_FLUSH, null, "kenshin-" + System.currentTimeMillis());
        call.resolve();
    }
    @PluginMethod public void stopSpeaking(PluginCall call) {
        if (tts != null) tts.stop();
        call.resolve();
    }
    @PluginMethod public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }
    @PluginMethod public void getAccessibilityStatus(PluginCall call) {
        call.resolve(new JSObject().put("enabled", KenshinAccessibilityService.isEnabled(getContext()))
            .put("serviceConnected", KenshinAccessibilityService.active != null));
    }
    @PluginMethod public void captureVisibleScreen(PluginCall call) {
        KenshinAccessibilityService service = KenshinAccessibilityService.active;
        if (service == null) { call.reject("Enable Kenshin Accessibility in Android Settings, then return and retry."); return; }
        call.resolve(service.captureVisibleText());
    }
    @PluginMethod public void performScreenAction(PluginCall call) {
        if (!call.getBoolean("confirmed", false)) { call.reject("Action requires explicit confirmation in Kenshin."); return; }
        KenshinAccessibilityService service = KenshinAccessibilityService.active;
        if (service == null) { call.reject("Kenshin Accessibility is not enabled."); return; }
        String action = call.getString("action", "");
        boolean result = service.performUserAction(action, call.getString("target", ""));
        call.resolve(new JSObject().put("performed", result).put("action", action));
    }
    @Override public void handleOnDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        super.handleOnDestroy();
    }
}
