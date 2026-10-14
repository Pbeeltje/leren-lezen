package nl.pbeeltje.lerenlezen;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Vanuit de web-app (native.ts, zetKindslot): aan tijdens een oefening of spel, uit in menu's.
@CapacitorPlugin(name = "Kindslot")
public class KindslotPlugin extends Plugin {
    @PluginMethod
    public void zet(PluginCall call) {
        boolean aan = Boolean.TRUE.equals(call.getBoolean("aan", false));
        getActivity().runOnUiThread(() -> {
            if (getActivity() instanceof MainActivity) ((MainActivity) getActivity()).zetKindslot(aan);
            call.resolve();
        });
    }
}
