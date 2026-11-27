package com.kenshin.chloe

import android.app.ActivityManager
import android.content.Intent
import android.os.Bundle
import android.os.Process
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import java.util.Locale

private val Night = Color(0xFF101522)
private val Lime = Color(0xFFA4C639)

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)
        setContent { ChloeScreen(
            speak = { say(it) },
            launchApp = { name -> launchInstalledApp(name) },
            deviceStats = { readStats() }
        ) }
    }
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) tts?.language = Locale.getDefault()
    }
    private fun say(text: String) { tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "chloe-utterance") }
    private fun launchInstalledApp(name: String): String {
        val pm = packageManager
        val launcher = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val match = pm.queryIntentActivities(launcher, 0).firstOrNull {
            it.loadLabel(pm).toString().contains(name, ignoreCase = true)
        }
        val intent = match?.activityInfo?.let {
            Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
                .setClassName(it.activityInfo.packageName, it.activityInfo.name)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (intent != null) { startActivity(intent); return "Opening ${match.loadLabel(pm)}." }
        return "I couldn't find an installed app matching $name."
    }
    private fun readStats(): Pair<String, String> {
        val am = getSystemService(ACTIVITY_SERVICE) as ActivityManager
        val mem = ActivityManager.MemoryInfo()
        am.getMemoryInfo(mem)
        val total = mem.totalMem / (1024 * 1024)
        val available = mem.availMem / (1024 * 1024)
        val used = total - available
        val runtime = Runtime.getRuntime()
        val processUsed = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024)
        return Pair("Process CPU time: ${Process.getElapsedCpuTime()} ms", "RAM: $used / $total MB used · App heap: $processUsed MB")
    }
    override fun onDestroy() { tts?.shutdown(); super.onDestroy() }
}

@Composable
private fun ChloeScreen(
    speak: (String) -> Unit,
    launchApp: (String) -> String,
    deviceStats: () -> Pair<String, String>
) {
    var command by remember { mutableStateOf("") }
    var reply by remember { mutableStateOf("Hello! I'm Chloe. What would you like me to do?") }
    var cpu by remember { mutableStateOf("Reading…") }
    var ram by remember { mutableStateOf("Reading…") }
    var pending by remember { mutableStateOf<String?>(null) }
    val voiceLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (!spoken.isNullOrBlank()) { command = spoken }
    }
    LaunchedEffect(Unit) {
        while (true) {
            val stats = deviceStats()
            cpu = stats.first
            ram = stats.second
            delay(2000)
        }
    }
    fun handle(text: String) {
        val normalized = text.trim()
        when {
            normalized.startsWith("open ", true) -> {
                val result = launchApp(normalized.substringAfter(' '))
                reply = result
                speak(result)
            }
            normalized.contains("cpu", true) || normalized.contains("ram", true) || normalized.contains("memory", true) -> {
                reply = "$cpu\n$ram"; speak(reply)
            }
            normalized.startsWith("call ", true) || normalized.startsWith("message ", true) ||
                normalized.contains("order ", true) || normalized.startsWith("buy ", true) ||
                normalized.startsWith("download ", true) -> {
                pending = normalized
                reply = "This action needs your review before anything is sent, installed or purchased."
                speak(reply)
            }
            normalized.isNotBlank() -> {
                reply = "I heard: $normalized. Chloe's conversational AI provider is not connected yet."
                speak(reply)
            }
        }
    }
    MaterialTheme(colorScheme = darkColorScheme(primary = Lime, background = Night, surface = Color(0xFF1B2434))) {
        Surface(Modifier.fillMaxSize(), color = Night) {
            Column(Modifier.fillMaxSize().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("CHLOE", color = Lime, fontSize = 28.sp)
                Text("YOUR PERSONAL AI COMPANION", color = Color.LightGray, fontSize = 10.sp)
                Spacer(Modifier.height(18.dp))
                AndroidMascot()
                Spacer(Modifier.height(18.dp))
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF1B2434)), shape = RoundedCornerShape(18.dp)) {
                    Column(Modifier.fillMaxWidth().padding(16.dp)) {
                        Text("DEVICE MONITOR", color = Lime)
                        Text(cpu, color = Color.White, fontSize = 13.sp)
                        Text(ram, color = Color.White, fontSize = 13.sp)
                    }
                }
                Spacer(Modifier.height(14.dp))
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF1B2434))) {
                    Text(reply, Modifier.padding(16.dp), color = Color.White)
                }
                Spacer(Modifier.weight(1f))
                OutlinedTextField(value = command, onValueChange = { command = it }, label = { Text("Tell Chloe what to do") }, modifier = Modifier.fillMaxWidth())
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {
                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                        runCatching { voiceLauncher.launch(intent) }.onFailure {
                            reply = "Speech recognition is unavailable on this device."
                        }
                    }, modifier = Modifier.weight(1f)) { Text("Speak") }
                    Button(onClick = { handle(command) }, modifier = Modifier.weight(1f)) { Text("Run command") }
                }
            }
        }
    }
    pending?.let { action ->
        AlertDialog(
            onDismissRequest = { pending = null },
            title = { Text("Confirm with Chloe") },
            text = { Text("Requested action: $action\n\nThis starter build does not execute purchases, calls, messages, or downloads yet.") },
            confirmButton = { TextButton(onClick = { pending = null; reply = "Not executed. This action connector is not implemented yet." }) { Text("Got it") } },
            dismissButton = { TextButton(onClick = { pending = null }) { Text("Cancel") } }
        )
    }
}

@Composable
private fun AndroidMascot() {
    Canvas(Modifier.size(width = 190.dp, height = 190.dp)) {
        val s = size.width
        val green = Lime
        drawLine(green, Offset(s * .34f, s * .18f), Offset(s * .24f, s * .04f), strokeWidth = 7f)
        drawLine(green, Offset(s * .66f, s * .18f), Offset(s * .76f, s * .04f), strokeWidth = 7f)
        drawRoundRect(green, Offset(s*.20f,s*.18f), androidx.compose.ui.geometry.Size(s*.60f,s*.55f), androidx.compose.ui.geometry.CornerRadius(34f))
        drawRoundRect(green, Offset(s*.04f,s*.25f), androidx.compose.ui.geometry.Size(s*.12f,s*.42f), androidx.compose.ui.geometry.CornerRadius(24f))
        drawRoundRect(green, Offset(s*.84f,s*.25f), androidx.compose.ui.geometry.Size(s*.12f,s*.42f), androidx.compose.ui.geometry.CornerRadius(24f))
        drawRoundRect(green, Offset(s*.34f,s*.69f), androidx.compose.ui.geometry.Size(s*.14f,s*.25f), androidx.compose.ui.geometry.CornerRadius(20f))
        drawRoundRect(green, Offset(s*.52f,s*.69f), androidx.compose.ui.geometry.Size(s*.14f,s*.25f), androidx.compose.ui.geometry.CornerRadius(20f))
        drawCircle(Color.White, s*.035f, Offset(s*.39f,s*.34f))
        drawCircle(Color.White, s*.035f, Offset(s*.61f,s*.34f))
    }
}
