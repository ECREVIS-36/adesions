var app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
  },
  receivedEvent: function(id) {
    app.parentElement = document.getElementById(id);
    document.getElementById('validation').addEventListener('click', function() {
      app.formSubmit()
    })
    document.getElementById('validation').addEventListener('tap', function() {
      app.formSubmit()
    })
		document.getElementById('test').addEventListener('tap', function() {
			app.test_launcher()
		})
		document.getElementById('test').addEventListener('click', function() {
			app.test_launcher()
		})

    console.log('LOG_ADHESION : Received Event: ' + id);
    app.storage = window.localStorage;
		app.loadAdhesions( /*app.test_launcher()*/ )

  },
  champs: ["date d'inscription", "numéro d'adhérent", "prénom", "nom", "adresse", "cp", "ville", "mail", "tel", "montant", "clause"],
	champsControle: {
			"clause": ()=>  document.getElementById('clause').checked,
			"numéro d'adhérent":()=>{
				return true;
			/*	let adhesionExistante= app.adhesions.find( (adhesion)=> adhesion==document.getElementById("numéro d'adhérent")  );
				if (adhesionExistante && adhesionExistante.nom!=document.getElementById('nom')  ){
					app._alert( `Il existe dejà un adhérent avec ce numéro, mais pas le même nom`)
					return false;
				}
				*/
			},
		//	adresse:()=>document.getElementById('adresse').value.match(/^[0-9A-Za\-zéèàâêç\-, ]+$/),
		//	ville:()=>	document.getElementById('ville').value.match(/^[A-Za-z\-éèàâêç ]+$/),
		//	nom:()=>		document.getElementById('nom').value.match(/^[A-Za-z\-éèàâêç ]+$/),
		//	'prénom':()=>	document.getElementById('prénom').value.match(/^[A-Za-z\-éèàâêç ]+$/),
			"date d'inscription":()=> 	document.getElementById("date d'inscription").value <= new Date().toISOString().substring(0, 10)
	},
  formSubmit: function() {
    let el_erreur =app.champs.find(
        (e) => {
          console.log('"LOG_ADHESION',e)
					return  !document.getElementById(e).validity.valid  || (
 							app.champsControle.hasOwnProperty(e )
							&&
							!app.champsControle[e]()
					)
        }
      )
			if (el_erreur){
				app._alert( `${el_erreur} ${document.getElementById(el_erreur).value} n'est pas correct `)
			}else{
				console.log("LOG_ADHESION : controles ok");
				app.saveAdhesion()
			}
  }, adhesionFileName: "adhesions.csv",
 	objectValuesToCsv:(data)=>	Object.values(data).join(';') + '\n',
	arrayValuesToCsv:(data)=>		data.join(';') + '\n',
  saveAdhesion: function() {
		console.log('LOG_ADHESION : ---------------------------------------storing')
		let dataObj=	app.champs.reduce( (acc,key)=> {
				acc[key]=document.getElementById(key).value;
				return acc;
			},{} )
		let docPath=app.getStorageUrl()+'/'+app.adhesionFileName
		console.log('LOG_ADHESION : doc path in writting',docPath)
		window.resolveLocalFileSystemURL(docPath,  (file)=> {
			 	console.log('LOG_ADHESION : doc path in writing resolved',file)
    		app.writeInFile(
						file, app.objectValuesToCsv(dataObj)
					, ()=> console.log('LOG_ADHESION : successfully wrote'));
			}, (e) => console.error('LOG_ADHESION : ERREUR writing',JSON.stringify(e)));
  	},
	readFile: function(fileEntry, callBack) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(data) {
          console.log("LOG_ADHESION : Successful file read: ", data,fileEntry.fullPath, fileEntry.toInternalURL());
					data=app.arrayValuesToCsv(app.champs)
          callBack(data);
        };
        reader.readAsText(file)

      }, (e) => console.error(e,'failed to read inscriptions') );
  },
	writeInFile: function(file, data,callBack) {
		file.createWriter(function(fileWriter) {
			fileWriter.onwriteend = ()=>  callBack()
			fileWriter.onerror  = () =>  console.error('LOG_ADHESION : Failed to write' , e )
			try { fileWriter.seek(fileWriter.length); }
			catch (e) { console.error('LOG_ADHESION : error when seeking',e);}
			fileWriter.write(data);
		});
	},getStorageUrl_:()=>{

		return cordova.file.externalDataDirectory;
		if (cordova.file.externalApplicationStorageDirectory)
			return cordova.file.externalApplicationStorageDirectory
		else if (cordova.file.externalDataDirectory)
			return cordova.file.externalApplicationStorageDirectory
		else if (cordova.file.externalDataDirectory)
				return cordova.file.externalApplicationStorageDirectory
		else if (cordova.file.applicationStorageDirectory)
				return cordova.file.applicationStorageDirectory
		else if (cordova.file.externalDataDirectory)
				return cordova.file.externalDataDirectory
		else {
			console.error('pas de dir valable')
			return null;
		}
	},
	getStorageUrl:()=>{
		let url=app.getStorageUrl_()
		console.log("LOG_ADHESION : url is ",url)
		return url
	},
	createFile:function(callBack){
			window.resolveLocalFileSystemURL(app.getStorageUrl(), function (dirEntry) {
    		dirEntry.getFile(app.adhesionFileName, {create: true, exclusive: false}, function(fileEntry) {
        	writeInFile(fileEntry, app.objectValuesToCsv (app.champs) ,callBack);
    		} ,()=> console.error('inpossible de créer le fichier'));
		}, ()=>console.error('impossible d accéder à',app.getStorageUrl())) ;
	},
  loadAdhesions: function(callBack) {
			window.resolveLocalFileSystemURL(app.getStorageUrl()+'/'+app.adhesionFileName,  (dirEntry)=> {
				app.readFile(file, (data) => {
					let array_inscriptions = data.split('\n').map(e => e.split('|'))
					app.adhesions= array_inscriptions.map(
									d => d.reduce(
										(acc, v, i) => {
											acc[app.champs[i]] = v;
											return v;
										}, {}));
					console.log('LOG_ADHESION : adhesions read',app.adhesions)
					callBack();
					});
				}, ()=> app.createFile( () => app.loadAdhesions(callBack) )
			);
		},
	test_launcher:()=>{
		//	app.del( ()=>{
		window.test=true;
		let datas={
								"date d'inscription":[
											new Date(2019,10,10).toISOString().substring(0, 10),
											new Date(2020,10,10).toISOString().substring(0, 10),
											new Date().toISOString().substring(0, 10),
											new Date().toISOString().substring(0, 10),
											new Date().toISOString().substring(0, 10),
											new Date().toISOString().substring(0, 10),
											new Date().toISOString().substring(0, 10)
										],
								"numéro d'adhérent":[1,100,55,13],
								"prénom":['Stéphane','Alain','i','stephane , et george','Stéphane','Stéphane','Stéphane','Stéphane','Stéphane','Stéphane','Stéphane'],
								"nom":['Goyet','Parcontre','i','alpha3','goyet','goyet','goyet','goyet','goyet','goyet','goyet','goyet','goyet'],
								"adresse":['1','bla','33 route des choseaux','33 route des choseaux','33 route des choseaux','33 route des choseaux','33 route des choseaux','33 route des choseaux'],
								"cp":[74000,13,74000,74000,74000,74000,74000,74000,],
								"ville":['1','ia','Annecy',,'Annecy','Annecy','Annecy','Annecy','Annecy','Annecy','Annecy'],
								"mail":['sgoyet@yahoo.fr','','bla','sgoyet@yahoo.fr','sgoyet@yahoo.fr','sgoyet@yahoo.fr','sgoyet@yahoo.fr','sgoyet@yahoo.fr'],
								"tel":['01','0682526723','i','0682526723','0682526723','0682526723','0682526723','0682526723','0682526723'],
								"montant":[100,101,102,103,104,105,106,107,108,-2,1.3],
								"clause":[0,1,1,1,1,1,1,1],
							};
		app.test(0,datas)
	},
	test:(i,datas)=>{
		console.log("LOG_ADHESION : ----------------------------start")
		Object.keys(datas).map( key=> {
				 let v=datas[key][ Math.floor(Math.random() * Math.floor(datas[key].length-1))  ]
				 if (key!='clause')
				 	document.getElementById(key).value=v;
				else
					document.getElementById(key).checked=v==1
				console.log(key,document.getElementById(key).value,  v)
		});
		app.formSubmit();

		if (i<10)setTimeout(function(){app.test(++i,datas)},1000)
		else {
				window.test=false
				app.loadAdhesions(()=>1)
		}

	}, _alert:function(mess){
		if (window.test) console.log('LOG_ADHESION : alerte ',mess)
		else alert(mess)
	},
	del:(callBack)=> {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
        dir.getFile(app.adhesionFileName, {create: false}, function (fileEntry) {
            fileEntry.remove(function (file) {
                alert("fichier supprimé");
								callBack();
            }, function () {
                alert("erreur suppression " + error.code);
            }, function () {
                alert("fichier n'existe pas");
            });
        });


    });

}


};
window.test=false
app.initialize();
