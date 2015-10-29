                    function comparabile(stringa){
                        return stringa.toLowerCase().replace(/ /g,"");
                    }
                    
                    function convalida(valore){
                        if (valore==='')
                            return false;
                        var unico = true;
                        $('#listaVoti li').each(function(){
                            if (comparabile($(this).text())===valore){
                                unico=false;
                                return;
                            }
                        });
                     return unico;   
                    }
                    $("form").on("submit",function(event){
                        //TO DO: Client Side Validation
                        var fields = $(this).serializeArray();
                        var daControllare =comparabile(fields[0].value); 
                        if (daControllare===''){
                            alert('Inserire un valore');
                            $('#CasellaTesto').val('');
                            return false;
                        }else                        
                        if (convalida(daControllare)===false){
                            //TO DO: finestra carina
                            alert('Elemento gia\' presente');
                            $('#CasellaTesto').val('');
                            return false;
                            }
                        else{
                            socket.emit('nuovoElemento',fields[0].value);
                            $('#CasellaTesto').val('');
                            event.preventDefault(); 
                        }
                    });
                    socket.on('votato',function(testo){
                        socket.emit('voto',testo);
                        //-TO DO: aggiungere finestrella carina!
                        alert('Hai votato per '+ testo +'!');
                    })
