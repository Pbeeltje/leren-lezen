package nl.pbeeltje.lerenlezen;

import android.graphics.Color;
import android.graphics.Rect;
import android.os.Bundle;
import android.view.View;
import androidx.activity.EdgeToEdge;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.util.Arrays;
import java.util.Collections;

public class MainActivity extends BridgeActivity {
    private static final int ACHTERGROND = Color.parseColor("#0f1b3d");
    // Android staat per zijrand hooguit 200 dp uitzondering op het terug-gebaar toe.
    private static final int RAND_HOOGTE_DP = 200;
    private static final int RAND_BREEDTE_DP = 40;
    private boolean kindslot = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Eerst het gewone app-thema (zonder titelbalk). EdgeToEdge.enable maakt het venster al
        // aan; met nog het opstart-thema kreeg dat een titelbalk ("Leren..." met het
        // opstartplaatje uitgerekt erachter) die onder de statusbalk bleef staan.
        setTheme(R.style.AppTheme_NoActionBar);
        // Aanbevolen door Capacitor 8 (SystemBars, insetsHandling 'css'): de webview loopt
        // tot de randen, de CSS houdt met --safe-area-inset-* rekening met de balken.
        EdgeToEdge.enable(this);
        registerPlugin(KindslotPlugin.class);
        super.onCreate(savedInstanceState);
        // Bij een oudere webview (< Chrome 140) zet Capacitor de webview met marge tussen de
        // balken; die marge moet de app-kleur hebben, anders blijft er oude beeldinhoud staan.
        getWindow().getDecorView().setBackgroundColor(ACHTERGROND);
        View webview = getBridge().getWebView();
        webview.setBackgroundColor(ACHTERGROND);
        if (webview.getParent() instanceof View) ((View) webview.getParent()).setBackgroundColor(ACHTERGROND);
        houdOnderrandVrij(webview);
    }

    // Kindslot (KindslotPlugin, vanuit de web-app): aan tijdens een oefening of spel, uit in
    // menu's zodat een ouder er gewoon uit kan.
    void zetKindslot(boolean aan) {
        kindslot = aan;
        WindowInsetsControllerCompat balken = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (aan) verbergBalken();
        else balken.show(WindowInsetsCompat.Type.systemBars());
        View webview = getBridge().getWebView();
        zetRanden(webview, webview.getWidth(), webview.getHeight());
    }

    // Status- en navigatiebalk verbergen (alleen met kindslot): kinderen tikten per ongeluk
    // op terug/home en trokken de snelle instellingen (zaklamp, wifi) naar beneden. Een veeg
    // vanaf de rand laat de balken eerst even zien; pas een tweede veeg opent de instellingen
    // of gaat naar het beginscherm.
    private void verbergBalken() {
        WindowInsetsControllerCompat balken = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        balken.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        balken.hide(WindowInsetsCompat.Type.systemBars());
    }

    // Met kindslot onderaan de linker- en rechterrand geen terug-gebaar: daar sleep je in het
    // vangspel en bij tafeltennis het figuurtje of batje heen en weer, en een veeg tot over
    // de rand sloot dan het spel. Hoger op de rand werkt terug gewoon.
    private void houdOnderrandVrij(View view) {
        view.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> zetRanden(v, r - l, b - t));
    }

    private void zetRanden(View v, int w, int h) {
        float dp = getResources().getDisplayMetrics().density;
        int hoogte = Math.round(RAND_HOOGTE_DP * dp);
        int breedte = Math.round(RAND_BREEDTE_DP * dp);
        ViewCompat.setSystemGestureExclusionRects(
            v,
            kindslot
                ? Arrays.asList(new Rect(0, Math.max(0, h - hoogte), breedte, h), new Rect(w - breedte, Math.max(0, h - hoogte), w, h))
                : Collections.emptyList()
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && kindslot) verbergBalken();
    }
}
