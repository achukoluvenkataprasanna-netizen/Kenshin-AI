import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const app = path.join(root, "android/app/src/main");
const javaDir = path.join(app, "java/com/kenshin/ai");
const resDir = path.join(app, "res/xml");
fs.mkdirSync(javaDir, { recursive: true });
fs.mkdirSync(resDir, { recursive: true });
for (const file of ["KenshinNativePlugin.kt", "KenshinAccessibilityService.kt"]) {
  fs.copyFileSync(path.join(root, "native/android", file), path.join(javaDir, file));
}
fs.copyFileSync(path.join(root, "native/android/accessibility_service_config.xml"), path.join(resDir, "kenshin_accessibility_service.xml"));
const stringsPath = path.join(app, "res/values/strings.xml");
let strings = fs.existsSync(stringsPath) ? fs.readFileSync(stringsPath, "utf8") : "<resources>\n</resources>";
if (!strings.includes("kenshin_accessibility_description")) {
  strings = strings.replace("</resources>", '    <string name="kenshin_accessibility_description">Allows Kenshin to read visible screen text only when you request it and perform actions you explicitly confirm.</string>\n</resources>');
  fs.writeFileSync(stringsPath, strings);
}
const manifestPath = path.join(app, "AndroidManifest.xml");
let manifest = fs.readFileSync(manifestPath, "utf8");
if (!manifest.includes("android.permission.RECORD_AUDIO")) {
  manifest = manifest.replace("<application", '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <application');
}
if (!manifest.includes("KenshinAccessibilityService")) {
  const service = '        <service android:name="com.kenshin.ai.KenshinAccessibilityService" android:label="Kenshin screen assistant" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" android:exported="true"><intent-filter><action android:name="android.accessibilityservice.AccessibilityService" /></intent-filter><meta-data android:name="android.accessibilityservice" android:resource="@xml/kenshin_accessibility_service" /></service>\n';
  manifest = manifest.replace("</application>", service + "</application>");
}
fs.writeFileSync(manifestPath, manifest);
const activityPath = path.join(javaDir, "MainActivity.java");
if (!fs.existsSync(activityPath)) {
  fs.writeFileSync(activityPath, "package com.kenshin.ai;\nimport android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;\npublic class MainActivity extends BridgeActivity {\n  @Override public void onCreate(Bundle savedInstanceState) {\n    registerPlugin(KenshinNativePlugin.class);\n    super.onCreate(savedInstanceState);\n  }\n}\n");
} else {
  let activity = fs.readFileSync(activityPath, "utf8");
  if (!activity.includes("registerPlugin(KenshinNativePlugin.class)")) {
    activity = activity.replace("import com.getcapacitor.BridgeActivity;", "import com.getcapacitor.BridgeActivity;\nimport com.kenshin.ai.KenshinNativePlugin;");
    activity = activity.replace("super.onCreate(savedInstanceState);", "registerPlugin(KenshinNativePlugin.class);\n    super.onCreate(savedInstanceState);");
    fs.writeFileSync(activityPath, activity);
  }
}
console.log("Installed Kenshin native voice and accessibility bridge.");
