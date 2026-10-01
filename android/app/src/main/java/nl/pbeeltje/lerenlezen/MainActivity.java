package nl.pbeeltje.lerenlezen;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.activity.EdgeToEdge;
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
    }
}
