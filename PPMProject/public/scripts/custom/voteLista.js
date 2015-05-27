	/*			function prendiTesto(liItem){
					var testo = liItem.children('a').text();
					return testo.
				}*/

				socket.on('aggiornaListaVoto',function(lista,lunghezzaListaServer){
                    if ($("#listaVoti li").length>=lunghezzaListaServer){
                                    return;                         
                                }
                                $.each(lista, function(key, value){
                                  $('<li data-icon="true"><a href="#risposta" data-rel="dialog">'+ value +'<span id="'+value.replace(/ /g,'')+'" class="ui-li-count contatoreVoto">42</span></a></li>')
                                        .appendTo("#listaVoti")
                                        .hide();
                                });
                                $(".contatoreVoto").hide();
                                $("#listaVoti").listview("refresh");
                                $("#listaVoti li:hidden").each(function(){
                                        $(this).slideDown(1000);
                                        if (votato){
                                        		var liItem=$(this);
                                                liItem.prop("data-icon","false");
                                            } 
                                });
                                if (votato){
                                	$(".contatoreVoto").show();
                                }
                    }) ;
               
                    function disabilitaVoto(){
                        votato = true;
                        $("#listaVoti li").each(function(i){
                        	var liItem=$(this);
                            liItem.addClass('ui-disabled')
                            .prop("data-icon","false");
                        });
                        $(".nuovoTitolo").hide();                     
                       	$(".contatoreVoto").show();
                        //window.location.reload(true);
                    }   
                    
                    $("#listaVoti").on("click","li",function(event){
                    	var testo= $(this).text().replace(/<span?=<\/span>/i,'');
                    	console.log(testo);
                        socket.emit('voto',testo);
                    }); 
                    
                    socket.on('disabilitaVoto',function(){
                        disabilitaVoto();
                    });