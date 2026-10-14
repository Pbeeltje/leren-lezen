import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// Kindslot: tijdens een oefening of spel (native.ts zetKindslot) de statusbalk weg en vegen
// vanaf de boven- en onderrand eerst "uitstellen": de eerste veeg laat alleen een streepje
// zien, pas een tweede veeg opent het berichtencentrum of gaat naar het beginscherm. In
// menu's staat alles gewoon, zodat een ouder er makkelijk uit kan.
class MainViewController: CAPBridgeViewController {
    var kindslot = false {
        didSet {
            bridge?.statusBarVisible = !kindslot
            setNeedsUpdateOfScreenEdgesDeferringSystemGestures()
        }
    }

    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { kindslot ? [.top, .bottom] : [] }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(KindslotPlugin())
    }
}

@objc(KindslotPlugin)
public class KindslotPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "KindslotPlugin"
    public let jsName = "Kindslot"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "zet", returnType: CAPPluginReturnPromise)]

    @objc func zet(_ call: CAPPluginCall) {
        let aan = call.getBool("aan") ?? false
        DispatchQueue.main.async {
            (self.bridge?.viewController as? MainViewController)?.kindslot = aan
            call.resolve()
        }
    }
}
