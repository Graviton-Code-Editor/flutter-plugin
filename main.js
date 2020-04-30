import Flutter from 'flutter-node'

function entry({
	StatusBarItem,
	ContextMenu,
	RunningConfig,
	EnvClient
}){
	let flutterDevices = [
		{
			name:'No devices found.'
		}
	]
	let flutterApp;
	let selectedDevice;
	const button = new StatusBarItem({
		label:'Detecting devices',
		action:(e)=>{
			new ContextMenu({
				list:[
					...
					flutterDevices.map( device => {
						return {
							label: device.name,
							action:()=>{
								selectedDevice = device
							}
						}
					}),
					{},
					{
						label:'Run',
						action(e){
							new ContextMenu({
								list:[
									...
									RunningConfig.data.workspaceConfig.folders.map( folder => {
										return {
											label: folder.path,
											action(){
												runApp(flutterApp,folder,selectedDevice,EnvClient,RunningConfig)
											}
										}
									})
								],
								x:e.pageX,
								y:e.pageY,
								parent:e.target
							})
						}
					},
					{
						label:'Hot reload',
						action(){
							flutterApp && flutterApp.reload()
						}
					},
					{
						label:'Close',
						action(){
							flutterApp && flutterApp.close()
						}
					}
				],
				x:e.pageX,
				y:e.pageY,
				parent:e.target
			})
		}
	})
	Flutter.isInstalled().then( res => {
		if( !res ){
			button.setLabel('Flutter is not installed')
		}
	})
	Flutter.getDevices().then( res => {
		if( res.devices.length == 0 ){
			button.setLabel('No devices found')
		}else{
			selectedDevice = res.devices[0]
			button.setLabel( selectedDevice.name )
			flutterDevices = res.devices
		}
	})
}

function runApp(flutterApp,folder,selectedDevice,EnvClient,RunningConfig){
	if( !selectedDevice ) return
	flutterApp = new Flutter.app({
		path: folder.path,
		deviceId: selectedDevice.id
	})
	const flutterEnv = new EnvClient({
		name: 'Flutter'
	})
	flutterEnv.on('start',()=>{
		flutterApp.run({
			onData:function(data){
				console.log(data)
			},
			onExit:function(data){
				console.log(data)
			},
			onClose:function(data){
				console.log(data)
			}
		})
		RunningConfig.on('tabSaved',({ parentFolder }) => {
			if( parentFolder == folder.path ){ 
				flutterApp.reload();
			}
		})
	})
	flutterEnv.on('stop',() => {
		flutterApp && flutterApp.close()
	})
	flutterEnv.on('reload',() => {
		flutterApp && flutterApp.reload()
	})
}


module.exports = {
	entry
}