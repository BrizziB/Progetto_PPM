extends layout.jade
block head
    script(type='text/javascript', src='http://localhost:3000/socket.io/socket.io.js')

block content
    if votoAbilitato
        script var votato = false;
    else
        script var votato = true;
    #Votazione('data-role'= 'page')
        .ui-content('role' = 'main')
        p Seleziona un titolo
        mixin voto(link, testo)
                li #[a(href=link, data-rel='dialog')=testo]
        ul(data-role='listview', data-inset='false', id ='listaVoti')
            script.               
               var socket=io();
               socket.on('aggiornaListaVoto',function(lista,lunghezzaListaServer){
                    if ($("#listaVoti li").length>=lunghezzaListaServer){
                                    return;                         
                                }
                                $.each(lista, function(key, value){
                                  $('<li><a href="#risposta" data-rel="dialog">'+ value + '</a></li>')
                                        .appendTo("#listaVoti")
                                        .hide();
                                });   
                                $("#listaVoti").listview("refresh");
                                $("#listaVoti li:hidden").each(function(){
                                        $(this).slideDown(1000);
                                        if (votato){
                                            $(this).addClass('ui-disabled');
                                            }                                         
                                });
                    }) ;
                    function disabilitaVoto(){
                        votato = true;
                        $("#listaVoti li").each(function(i){
                            $(this).addClass('ui-disabled');
                        });
                        $("#listaVoti").listview("refresh"); 
                        $(".nuovoTitolo").hide();                     
                        //window.location.reload(true);
                    }          
                    $("#listaVoti").on("click","li",function(event){
                        //TO DO: logica di invio voto
                       socket.emit('voto',$("li").text());
                    }); 
                    socket.on('disabilitaVoto',function(){
                        disabilitaVoto();
                    })                              
         if aggiungiTitolo
            p.nuovoTitolo Oppure inserisci un nuovo titolo
                form.nuovoTitolo
                    div             
                        label(for='CasellaTesto')
                        //- Oppure inserisci un titolo 
                        input(type='text', name='CasellaTesto', id='CasellaTesto', placeholder='Inserisci titolo', data-clear-btn="true")
                        input(type='submit', value = 'Invia', id='InviaTesto')
                script.
                    function comparabile(stringa){
                        return stringa.toLowerCase().replace(/ /g,"");
                    }
                    
                    function convalida(valore){
                        if (valore==='')
                            return false;
                        var unico = true;
                        $('#listaVoti li').each(function(){
                            /*console.log($(this).text());
                            console.log($(this).text()===valore);
                            console.log(typeof($(this).text())===typeof(valore));*/
                            if (comparabile($(this).text())===valore){
                                unico=false;
                                return;
                            }
                        });
                     return unico;   
                    }
                    $("#nuovoTitolo").on("submit",function(event){
                        //TO DO: Client Side Validation
                        var fields = $(this).serializeArray();
                        //TO DO: controllare stringhe vuote di qualunque lunghezza
                        var daControllare =comparabile(fields[0].value); 
                        if (daControllare===''){
                            alert('Inserire un valore');
                            $('#CasellaTesto').val('');
                            return false;
                        }                        
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
                        //-TO DO: aggiungere finestrella carina!
                        alert('Hai votato per '+testo+'!');
                    })
     #risposta('data-role'= 'page')
        .ui-content('role'='main')
            p Grazie per avermi cliccato!
            p #[a(href='#main', data-rel='back', class='ui-btn ui-icon-back ui-btn-icon-left') Torna alla pagina principale ]