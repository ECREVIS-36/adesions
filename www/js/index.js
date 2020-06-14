var app = {
    testFileCreation: 0,
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
      "clause"
    ],
    adhesionFileName: "adhesions.csv",

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
        //app.test_launcher()
      })
      document.getElementById('validation').addEventListener('tap', function() {
        app.formSubmit()
        //app.test_launcher()
      })


      console.log('LOG_ADHESION : Received Event: ' + id);
    //  console.log('LOG_ADHESION : Cordova is : '+JSON.stringify(cordova));
      app.cordova=cordova
      app.storage = window.localStorage;
      app.loadAdhesions(); //ensure file is created

    },

    reinitFields: function() {
      for (var i=0;i<app.champs.length;i++){
          item=app.champs[i]
          console.log('LOG_ADHESION : réinit ' + item)
        if (item != 'clause')
          document.getElementById(item).value = ""
        else
          document.getElementById(item).checked = false
        console.log('LOG_ADHESION : réinit done '+ document.getElementById(item).value)
      };
    },
    champsControle: {
      "clause": function() {
        document.getElementById('clause').checked
      },
      "numéro d'adhérent": function() {
        return true;
      },
      "date d'inscription": function(){document.getElementById("date d'inscription").value <= new Date().toISOString().substring(0, 10)}
    },

    formSubmit: function() {

      var el_erreur =0
      for (var i=0;i<app.champs.length;i++){
          if (!document.getElementById(app.champs[i]).validity.valid) {
              el_erreur=app.champs[i];
              break;
            }
      }
      /*
      var el_erreur = app.champs.find(
        function(e) {
            console.log('"LOG_ADHESION', e)
            return !document.getElementById(e).validity.valid;// || (app.champsControle.hasOwnProperty(e) && !app.champsControle[e])
        }
      )
      */
      if (el_erreur) {
        app._alert(`${el_erreur} ${document.getElementById(el_erreur).value} n'est pas correct `)
      } else {
        console.log("LOG_ADHESION : controles ok");
        app.saveAdhesion()
      }
    },

    objectValuesToCsv: function(data) {
      return Object.keys(data).map(function(key) {
          return data[key];}
      ).join(';') + "\n";
    },

    arrayValuesToCsv: function(data) {
      return data.join(';') + '\n'
    },

    saveAdhesion: function() {
      console.log('LOG_ADHESION : ---------------------------------------storing')
      var dataObj = app.champs.reduce(function(acc, key) {
        acc[key] = document.getElementById(key).value;
        return acc;
      }, {})
      console.log("im a about to write "+JSON.stringify(dataObj))
      var docPath = app.getStorageUrl() + '/' + app.adhesionFileName;


      window.resolveLocalFileSystemURL(docPath, function(file) {
          app.writeInFile(
            file, app.objectValuesToCsv(dataObj),
            function() {
              console.log('LOG_ADHESION : successfully wrote')
              alert("Votre adhésion est bien enregistrée, merci !");
              app.reinitFields();
            });
        }, function(e) {
          console.error('LOG_ADHESION : ERREUR writing', JSON.stringify(e))
      });
    },

    readFile: function(fileEntry, callBack) {
      fileEntry.file( function(file) {
          var reader = new FileReader();
          reader.onloadend = function(data) {
            console.log("LOG_ADHESION : Successful file read: "+ data, fileEntry.fullPath +" on "+ fileEntry.toInternalURL());
            data = app.arrayValuesToCsv(app.champs)
            callBack(data);
          };
          reader.readAsText(file)

        }, function(e) { alert('LOG_ADHESION failed to read inscriptions :' + JSON.stringify(e) ); }
      )
  },
  writeInFile: function(file, data, callBack) {
    console.log("writeInFile started for "+data)
    file.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function() { callBack(); }
      fileWriter.onerror = function(e) { alert('LOG_ADHESION failed :' + JSON.stringify(e)) };
      try {
        fileWriter.seek(fileWriter.length);
      } catch (e) {
        alert('LOG_ADHESION, SEEK failed :' + JSON.stringify(e));
      }
      fileWriter.write(data);
    });
  },

  getStorageUrl_: function() {

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
    else 	return null;

  },

  getStorageUrl: function() {
    var url = app.getStorageUrl_()
    console.log("LOG_ADHESION :storage url is "+ url)
    if (!url) alert("LOG_ADHESION : pas de stockage disponible")
    return url
  },


  createFile: function(callBack) {

    window.resolveLocalFileSystemURL(app.getStorageUrl(),
      function(dirEntry) {
        dirEntry.getFile(
            app.adhesionFileName,
            { create: true, exclusive: false},
            function(fileEntry) {
                app.writeInFile( fileEntry, app.objectValuesToCsv(app.champs), callBack);
            },
            function() { alert('LOG_ADHESION CANNOT create file') }
        )
      }, function() { alert('LOG_ADHESION impossible d\'accéder à ' + app.getStorageUrl() )  }
    );
  },


  loadAdhesions: function(callBack) {

    app.testFileCreation = app.testFileCreation + 1
    console.log("LOG_ADHESION : load adhésion")
    if (app.testFileCreation > 2) {
      alert("LOG_ADHESION :création du fichier impossible, évitement de boucle en création ")
      return;
    }

    window.resolveLocalFileSystemURL(

      app.getStorageUrl() + '/' + app.adhesionFileName,
      function(dirEntry) {
        app.readFile(dirEntry, function(data) {return 1});
      },
      function() {
          app.createFile(function() {
              console.log("LOG_ADHESION le fichier " +app.getStorageUrl() + '/' + app.adhesionFileName+" n'existe pas, création")
              return app.loadAdhesions()
          })
      }
    );
  },

  _alert: function(mess) {
    if (window.test) console.log('LOG_ADHESION : alerte '+ mess)
    else alert(mess)
  },

  del: function(callBack) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
      dir.getFile(app.adhesionFileName, {
        create: false
      }, function(fileEntry) {
        fileEntry.remove(function(file) {
          alert("fichier supprimé");
          callBack();
        }, function() {
          alert("erreur suppression " + error.code);
        }, function() {
          alert("fichier n'existe pas");
        });
      });


    });

  },
  test_launcher:function(){
		window.test=true;
		var datas={
								"date d'adhésion":[
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
	test:function(i,datas){
		console.log("LOG_ADHESION : ----------------------------start")
		Object.keys(datas).map( function(key) {
        console.log(key);
				 var v=datas[key][ Math.floor(Math.random() * Math.floor(datas[key].length-1))  ]
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
				app.loadAdhesions(function(){return 1;})
		}
  }
}
//window.test=true;
console.log("app ok");
app.initialize();
