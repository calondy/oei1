


// busca y lee todos los archivos info.json y forma la lista de proyectos

self.addEventListener('message', Donmessage);



 function Donmessage (event) {
    console.log(event.data.type);
    
    if (event.data.type=='load' ) {
        loadFiles(event);
     }

     if (event.data.type=='save' ) {
        save(event,saved);
     }



  }
  
function saved(json){

    postMessage({type:"saved",data:json});

}


  function loadFiles(event){ 
        const paths =event.data.data.split(' ').map(f=>`${f}/info.json?rn=${Math.random()}`);
        
        console.log(JSON.stringify(paths,false,4));
  
   
        const promises = paths.map(path => fetch(path).then(response => response.json() ) );
         
         
  
         Promise.all(promises)
          .then(data => {
             const result = data.reduce((acc, val) => acc.concat(val), []);
             postMessage(result);
          })
          .catch(error => {
    
            postMessage({ error: error.message });
          });
  
        }
  


// {type:'save',data:"{}"}
        function save(event,fn){
let filename=event.data.data.folder+'/info.json';
         let str=JSON.stringify(event.data.data);





let formData = new FormData();


if(com && obj){
// se envia con dos paramentros $com=com y $data=obj 
    formData.append('filename', filename);
    formData.append('str', str);


 
fetch("sf.php",
    {
        body: formData,
        method: "post"
    }).then(data=>data.json()).then(json=>{

if(fn)fn(json);

    }).catch(err=>{
console.log(err);
if(fn)fn({"error":"error de datos leyendo "+filename})
    });
} 
  
}