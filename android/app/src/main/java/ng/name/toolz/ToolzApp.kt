package ng.name.toolz

import android.app.Application
import ng.name.toolz.data.AppState

class ToolzApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Preferences are needed before the first ad decision, so attach here
        // rather than waiting for the activity.
        AppState.attach(this)
    }
}
