var app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
  },
  testFileCreation:0,

  receivedEvent: function(id) {
    app.parentElement = document.getElementById(id);
    document.getElementById('validation').addEventListener('click', function() {
      app.formSubmit()
    })
    document.getElementById('validation').addEventListener('tap', function() {
      app.formSubmit()
    })
	/*
	document.getElementById('test').addEventListener('tap', function() {
			app.test_launcher()
	})
	document.getElementById('test').addEventListener('click', function() {
			app.test_launcher()
	})
	*/
    console.log('LOG_ADHESION : Received Event: ' + id);
    app.storage = window.localStorage;
		app.loadAdhesions();  //ensure file is created

  },
  champs: [
		"date d'adhésion",
		"numéro d'adhérent",
		"prénom",
		"nom",
		"adresse",
		"cp",
		"ville",
		"mail",
		"tel",
		"montant",
		"clause"],
	reinitFields:function(){
		app.champs.forEach((item, i) => {
			console.log('LOG_ADHESION : réinit',item)
			if (item!='clause')
				document.getElementById(item).value=""
			else 
				document.getElementById(item).checked=false
			console.log('LOG_ADHESION : réinit done',	document.getElementById(item).value)
		});
	},
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
  },

  	adhesionFileName: "adhesions.csv",
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
					, ()=> {
							console.log('LOG_ADHESION : successfully wrote')
							alert("Votre adhésion est bien enregistrée, merci !");
							app.reinitFields();
						});
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

      }, (e) => alert('failed to read inscriptions :'+JSON.stringify(e)) );
  },
	writeInFile: function(file, data,callBack) {
		file.createWriter(function(fileWriter) {
			fileWriter.onwriteend = ()=>  callBack()
			fileWriter.onerror  = () =>  alert('WRITE failed :'+JSON.stringify(e));
			try { fileWriter.seek(fileWriter.length); }
			catch (e) {  alert('SEEK failed :'+JSON.stringify(e)); }
			fileWriter.write(data);
		});
	},getStorageUrl_:()=>{
		return cordova.file.externalDataDirectory;
		/*if (cordova.file.externalApplicationStorageDirectory)
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
			alert('No directrory available');
			return null;
		}*/
	},
	getStorageUrl:()=>{
		let url=app.getStorageUrl_()
		console.log("LOG_ADHESION : url is ",url)
		if (!url) alert("Pas de stockage disponible")
		return url
	},
	createFile:function(callBack){
			window.resolveLocalFileSystemURL(app.getStorageUrl(), function (dirEntry) {
    		dirEntry.getFile(app.adhesionFileName, {create: true, exclusive: false}, function(fileEntry) {
        	writeInFile(fileEntry, app.objectValuesToCsv (app.champs) ,callBack);
    		} ,()=>  alert('CANNOT create file')   );
		}, ()=>alert('impossible d\'accéder à ' +app.getStorageUrl())) ;
	},
  	loadAdhesions: function(callBack) {
  		app.testFileCreation=app.testFileCreation+1
  		console.log("lLOG_ADHESION : oad adhésion")
  		if (app.testFileCreation>2) {
  			alert("loadAdhesions :création du fichier impossible ")
  			return;
  		}
		window.resolveLocalFileSystemURL(
				app.getStorageUrl()+'/'+app.adhesionFileName,
				(dirEntry)=> {
					app.readFile(file, (data) => 1);
				}, ()=> app.createFile( () => app.loadAdhesions() )
		);
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
