
Windows.UI.WebUI.WebUIApplication.addEventListener("activated", onActivatedHandler, false);  

function onActivatedHandler(eventArgs) {
	document.getElementById("SkypePamaraters").innerText = eventArgs.kind;

	if (eventArgs.kind == Windows.ApplicationModel.Activation.ActivationKind.protocol) 
	{
		document.getElementById("SkypePamaraters").innerText = eventArgs.uri.rawUri;
	}
}
