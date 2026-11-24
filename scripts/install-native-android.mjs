import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const app = path.join(root, "android/app/src/main");
const javaDir = path.join(app, "java/com/kenshin/ai");
const resDir = path.join(app, "res/xml");
fs.mkdirSync(javaDir, { recursive: true });
fs.mkdirSync(resDir, { recursive: true });
for (const file of ["KenshinNativePlugin.java", "KenshinAccessibilityService.java"]) {
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
// Safer sideload build: request microphone access only. Do not declare an
// AccessibilityService or broad installed-app visibility in this APK.
manifest = manifest.replace(/\s*<queries>[\s\S]*?<\/queries>\s*/g, "\n");
manifest = manifest.replace(/\s*<service[^>]*KenshinAccessibilityService[\s\S]*?<\/service>\s*/g, "\n");
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
console.log("Installed Kenshin native voice bridge. Accessibility service intentionally omitted from safer sideload APK.");
