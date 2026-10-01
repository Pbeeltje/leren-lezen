package nl.pbeeltje.lerenlezen;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.activity.EdgeToEdge;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int ACHTERGROND = Color.parseColor("#0f1b3d");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Aanbevolen door Capacitor 8 (SystemBars, insetsHandling 'css'): de webview loopt
        // tot de randen, de CSS houdt met --safe-area-inset-* rekening met de balken.
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        // Bij een oudere webview (< Chrome 140) zet Capacitor de webview met marge tussen de
        // balken; die marge moet de app-kleur hebben, anders blijft er oude beeldinhoud staan.
        getWindow().getDecorView().setBackgroundColor(ACHTERGROND);
        View webview = getBridge().getWebView();
        webview.setBackgroundColor(ACHTERGROND);
        if (webview.getParent() instanceof View) ((View) webview.getParent()).setBackgroundColor(ACHTERGROND);
        verbergNavigatieknoppen();
    }

    // De navigatieknoppen van Android (terug, home, overzicht) onderaan verbergen: kinderen
    // tikten er per ongeluk op, vooral tijdens het vangspel. Met een veeg vanaf de onderrand
    // komen ze even terug. De statusbalk bovenaan blijft gewoon staan.
    private void verbergNavigatieknoppen() {
        WindowInsetsControllerCompat knoppen = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        knoppen.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        knoppen.hide(WindowInsetsCompat.Type.navigationBars());
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) verbergNavigatieknoppen();
    }
}
