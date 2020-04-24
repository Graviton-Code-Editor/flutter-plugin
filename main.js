import Flutter from 'flutter-node'

function entry({
	StatusBarItem,
	ContextMenu,
	RunningConfig,
	envClient
}){
	let _devices = [
		{
			name:'No devices found.'
		}
	]
	let _app;
	const button = new StatusBarItem({
		label:'Detecting devices',
		action:(e)=>{
			new ContextMenu({
				list:[
					...
					_devices.map(function(dev){
						return {
							label:dev.name,
							action:()=>{
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
									RunningConfig.data.workspaceConfig.folders.map(function(folder){
										return {
											label:folder.path,
											action:()=>{
												_app = new Flutter.app({
													path:RunningConfig.data.workspaceConfig.folders[0].path.replace(/\\/g,'\\\\'),
													deviceId:_devices[0].id
												})
												_app.run({
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
												RunningConfig.on('tabSaved',function({
													parentFolder
												}){
													if(parentFolder == folder.path){ //Check if the modified tab is from the flutter app
														_app.reload()
													}
												})
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
							_app.reload()
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
		if(res.devices.length == 0){
			button.setLabel('No devices found')
		}else{
			button.setLabel(res.devices[0].name)
			_devices = res.devices
		}
	})
}

module.exports = {
	entry
}