// https://github.com/apache/cordova-plugin-file/blob/master/README.md

let adhesionFileName="adhesions.csv";


function acessAdhesion(data){
	let fileDir=null
	if (android) fileDir=cordova.file.dataDirectory;
	else fileDir=cordova.file.dataDirectory;
	window.resolveLocalFileSystemURL(fileDir, function(dir) {
			console.log("LOG_ADHESION : got main dir",dir);
			dir.getFile(adhesionFileName {create:true}, function(file) {
				console.log("LOG_ADHESION : got the file", file);
				callBack(file);
			});
		});
}
function saveAdhesion(adhesion){
	acessAdhesion(adtion(file){
				writeInFile(file,adhesion);
	})
}
function loadAdhesions(){
	acessAdhesion(function(file){
				readFile(fileEntry, (data)=>{

					let array_inscriptions=data.split('\n').map(e => e.split('|')
					let keys=array_inscriptions.pop()
					callBack(
							array_inscriptions.map(
									i => i.reduce (
											(acc,v,i )  =>{
													acc[keys[i]]=v;
													return v ; }
											,{} )
							)
					);
				})
	})
}


function writeInFile(file,dataObj) {

    file.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function() {console.log("LOG_ADHESION : Successful file write..."); }
        fileWriter.onerror = function (e) {console.log("LOG_ADHESION : Failed file read: " + e.toString());}

        try {fileWriter.seek(fileWriter.length);}
        catch (e) {console.error("file doesn't exist!");}
        fileWriter.write( dataObj.values.join('|')+'\n' );

    });
}

function readFile(fileEntry,callBack) {
    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
  				console.log("LOG_ADHESION : Successful file read: " , data);
					callBack(data);
        };
        reader.readAsText(file)

    }, ()=> console.error('failed to read inscriptions')));
}
