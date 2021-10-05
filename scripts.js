	var symbol = "";
	var symbolb = "";
	var close;
	var open;
	var low;
	var volume;
	var symbols = [];
	let toggle = true;
	let toggleReduce = true;
	var stream;
	let streams = [
    "ethusdt@miniTicker","bnbusdt@miniTicker","btcusdt@miniTicker","xrpusdt@miniTicker",
    "eosusdt@miniTicker","ltcusdt@miniTicker","linkusdt@miniTicker","trxusdt@miniTicker",
    "adausdt@miniTicker", "etcusdt@miniTicker", "neousdt@miniTicker", "bchabcusdt@miniTicker",
    "xlmusdt@miniTicker", "iostusdt@miniTicker", "tomousdt@miniTicker", "etcusdt@miniTicker"
  ];

  let trackedStreams = [];

  let ws = new WebSocket("wss://stream.binance.com:9443/ws/" + streams.join('/'));

  ws.onopen = function() {
  };

  ws.onmessage = function(evt) {
      let msgs = JSON.parse(evt.data);
      if (Array.isArray(msgs)) {
        for (let msg of msgs) {
          handleMessage(msg);
        }
      } else {
        handleMessage(msgs)
      }
  }

  ws.onclose = function() {
    console.log("Binance disconnected");
  }
  var symbol;

  function handleMessage(msg) {
    const stream = msg.s;

    if (document.getElementById('stream_symbol_' + stream) == null) {
    	if (trackedStreams.indexOf(stream) === -1) {
			document.getElementById('streams').innerHTML += 
		    "<a class='nav-link tokenElement' style='line-height: 30px;' vertical-align='center' id='____" + stream + "' onclick=updateData(this);>" + 
		    "<li class='nav-item' vertical-align='center'>" + 
		    "<div class='row justify-content-start align-items-between' style='padding-right: 10%;'>" +
		    "<div class='col-3 tokentable' align='left' id='stream_symbol_" + stream + "'></div>" + 
		    "<div class='col-6 tokentable' align='right' id='stream_price_" + stream + "'></div>" +
		    "<div class='col-3 tokentable' align='right' id='stream_change_" + stream + "' style='padding: 0;'></div></div></li></a>";
		    $("#streams a").sort(function(a,b){
		    if(a.id < b.id) {
		        return -1;
		    } else {
		        return 1;
		    }
			}).each(function() { $('#streams').append(this);});
    	}
  	}
  	document.getElementById('stream_symbol_' + stream).innerText = stream
    document.getElementById('stream_price_' + stream).innerText = parseFloat(msg.c).toFixed((msg.c > 1000 ? 2 : (msg.c > 100 ? 3 : (msg.c > 10 ? 4 : 5))));
    document.getElementById('stream_change_' + stream).innerText = (parseFloat((msg.c-msg.o)/msg.o*100) < 0 ? parseFloat((msg.c-msg.o)/msg.o*100).toFixed(2) + "%" : "+" + parseFloat((msg.c-msg.o)/msg.o*100).toFixed(2) + "%");
    parseFloat((msg.c-msg.o)/msg.o*100) < 0 ? $('#stream_change_' + stream).css('color', '#DC3546') : $('#stream_change_' + stream).css('color', '#25A842');
    if (document.getElementById(stream + "symbol") != null) {
    	$('#load').hide(100);
    	$('#load2').hide(100);
    	(parseFloat((msg.c-msg.o)/msg.o*100)) < 0 ? $('#' + stream + 'change').css('color', '#DC3546') : $('#' + stream + 'change').css('color', '#25A842');
	    document.getElementById(stream + "symbol").innerText = stream;
	    document.getElementById(stream + "price").innerText = parseFloat(msg.c).toFixed((msg.c > 1000 ? 2 : (msg.c > 100 ? 3 : (msg.c > 10 ? 4 : 5))));
	    document.getElementById(stream + "change").innerText = "(" + (parseFloat((msg.c-msg.o)/msg.o*100) < 0 ? parseFloat((msg.c-msg.o)/msg.o*100).toFixed(2) + "%)" : "+" + parseFloat((msg.c-msg.o)/msg.o*100).toFixed(2) + "%)");
	    document.getElementById(stream + "volume").innerText = parseFloat(msg.q).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " USD";
	    document.getElementById(stream + "low").innerText = parseFloat(msg.l).toFixed((msg.l > 1000 ? 2 : (msg.l > 100 ? 3 : (msg.l > 10 ? 4 : 5))));
	    document.getElementById(stream + "high").innerText = " - " + parseFloat(msg.h).toFixed((msg.h > 1000 ? 2 : (msg.h > 100 ? 3 : (msg.h > 10 ? 4 : 5))));
	}
	if(document.getElementById("_pos_" + stream) != null){
		document.getElementById("_pos_" + stream).innerText = 
		parseFloat((msg.c-document.getElementById("_avg_" + stream).innerHTML)*
			(parseFloat(document.getElementById('_amount_' + stream).innerText) + 0.00001)).toFixed(2);
		
		document.getElementById("_ch_" + stream).innerText = "(" + 
		parseFloat((msg.c-document.getElementById("_avg_" + stream).innerText)/
			(document.getElementById("_avg_" + stream).innerText)*100*((parseFloat(document.getElementById('_amount_' + stream).innerText) + 0.00001)/
				Math.abs(parseFloat(document.getElementById('_amount_' + stream).innerText) + 0.00001))).toFixed(2) + "%)";
		
		document.getElementById("_pos_" + stream).innerText < 0 ? $("#_pl_" + stream).css('color', '#DC3546') : $("#_pl_" + stream).css('color', '#25A842');
	}
	if(document.getElementById("_pos_" + stream) != null){
		var exists = false
		for (var i = 0; i < symbols.length; i++){

			if (symbols[i]['symbol'] == stream) {
				exists = true
			}
		}
		
		if (exists == false)
			symbols.push({ symbol: stream, price: document.getElementById("_pos_" + stream).innerText });
		else {
			for (var i = 0; i < symbols.length; i++) {
		  		if (symbols[i].symbol === stream) {
		    		symbols[i].price = document.getElementById("_pos_" + stream).innerText;
		   		 break;
		  		}
			}
		}
	}
	sumPl();
	if (parseFloat(document.getElementById('balance').innerText) + parseFloat(document.getElementById('openPl').innerText) < parseFloat(document.getElementById('balance').innerText*0.2)) {
		$('#liquidation').show(100);
	}
	else {
		$('#liquidation').hide(100);
	}
}

function updateData(msg){
	if (document.activeElement.innerText != 'x') {
		$('#load').show(100);
		$('#load2').show(100);
		symbol = (msg.id).substring(4);
		document.getElementById('amountsymbol').innerText = symbol.replace("USDT", "");
		document.getElementById(symbolb + "symbol").id = symbol + "symbol";
		document.getElementById(symbolb + "price").id = symbol + "price";
		document.getElementById(symbolb + "low").id = symbol + "low";
		document.getElementById(symbolb + "high").id = symbol + "high";
		document.getElementById(symbolb + "volume").id = symbol + "volume";
		document.getElementById(symbolb + "change").id = symbol + "change";
		document.getElementById('symbol').value = symbol;
		document.getElementById(symbol + "symbol").innerText = symbol;
		if (document.getElementById('stream_price_' + symbol) != null){
			document.getElementById(symbol + "price").innerText = document.getElementById('stream_price_' + symbol).innerHTML;
			document.getElementById(symbol + "change").innerText = document.getElementById('stream_change_' + symbol).innerHTML;
			document.getElementById(symbol + "high").innerText = ""
			document.getElementById(symbol + "low").innerText = ""
			document.getElementById(symbol + "volume").innerText = ""
		}
		symbolb = symbol;

		if (toggle === true){
			makeChart(symbol);	
		}
	}
}

function toggleChart(){
	
	if (toggle == true){
		toggle = false;
		document.getElementById('toggle').className = "btn btn-danger";
		document.getElementById('toggle').innerText = "Unlock Chart";
	}
	else{
		toggle = true;
		document.getElementById('toggle').className = "btn btn-success";
		document.getElementById('toggle').innerText = "Lock Chart";
	}
}

function toggleOrder(){
	
	if (toggleReduce == true){
		toggleReduce = false;
		document.getElementById('r').className = "btn btn-danger btnbar";
		document.getElementById('r').innerText = "Reduce";
	}
	else{
		toggleReduce = true;
		document.getElementById('r').className = "btn btn-success btnbar";
		document.getElementById('r').innerText = "Increase";
	}
}

$(document).ready( function () {
	updateData({'id': "_id_BTCUSDT"})
	updateBalance();
	updatePositions();
	$('#amount').on('input', function() {
		document.getElementById('value').innerText = (document.getElementById('amount').value * document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " USD"
	})
	$('#q').on('click', function() {
		if (toggleReduce == true) {
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById('margin').innerHTML*0.25/document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(4))
		}
		else {
			if (document.getElementById("_amount_" + document.getElementById('symbol').value) != null)
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById("_amount_" + document.getElementById('symbol').value).innerHTML*0.25).toFixed(4))
			else
				document.getElementById('amount').value = 0;
		}
		document.getElementById('value').innerText = (document.getElementById('amount').value * document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " USD"	
	})
	$('#h').on('click', function() {
		if (toggleReduce == true) {
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById('margin').innerHTML*0.5/document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(4))
		}
		else {
			if (document.getElementById("_amount_" + document.getElementById('symbol').value) != null)
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById("_amount_" + document.getElementById('symbol').value).innerHTML*0.5).toFixed(4))
			else
				document.getElementById('amount').value = 0;
		}
		document.getElementById('value').innerText = (document.getElementById('amount').value * document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " USD"	
	});
	$('#hq').on('click', function() {
		if (toggleReduce == true) {
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById('margin').innerHTML*0.75/document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(4))
		}
		else {
			if (document.getElementById("_amount_" + document.getElementById('symbol').value) != null)
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById("_amount_" + document.getElementById('symbol').value).innerHTML*0.75).toFixed(4))
			else
				document.getElementById('amount').value = 0;
		}
		document.getElementById('value').innerText = (document.getElementById('amount').value * document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " USD"
	})
	$('#f').on('click', function() {
		if (toggleReduce == true) {
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById('margin').innerHTML/document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(4))
		}
		else {
			if (document.getElementById("_amount_" + document.getElementById('symbol').value) != null)
			document.getElementById('amount').value = Math.abs(parseFloat(document.getElementById("_amount_" + document.getElementById('symbol').value).innerHTML).toFixed(4))
			else
				document.getElementById('amount').value = 0;
		}
		document.getElementById('value').innerText = (document.getElementById('amount').value * document.getElementById(document.getElementById('symbol').value + "price").innerText).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " USD"
	})
	$('form').submit( function () {
		var side = $(document.activeElement).attr('id');
		var symbol = $("input#symbol").val().replace("USDT", "");
		var amount = $("input#amount").val();
		if (side == 'close') {
			symbol = $(document.activeElement).attr('name');
		}
		var data = 'side='+ side + '&symbol=' + symbol + '&amount=' + amount;
		$.ajax({
		    type: "POST",
		    url: "order.php",
		    data: data,
			success: function(data) {
				if (data != null)
					response = JSON.parse(data)
       			if (side == 'close') {
       				$('#_id_' + symbol + 'USDT').remove();
       				for (var i = 0; i < symbols.length; i++) {
				  		if (symbols[i].symbol === symbol + "USDT") {
				    		symbols[i].price = 0
				   		 break;
				  		}
					}
       			}
       			if (response.message == null || response.message == '') {
       				console.log(response);
       			}
       			else {
       				if (response.status == true) {
       					$('#value').hide();
       					$('#success').text(response.message);
       					$('#success').show(100).delay(3000).hide(100)
       					$('#value').show();
       				}
       				else {
	       				$('#value').hide();
	       				$('#error').text(response.message);
	       				$('#error').show(100).delay(3000).hide(100);
	       				$('#value').show();
       				}
       				
       			}
   				$('#amount').val('');
   				updatePositions();
       			updateBalance();
       			}
		});
		return false;
	});
});

function updatePositions(){
	$.getJSON('positionTable.php', function(data) {
	    $.each(data, function(index, array) {
	    	if (document.getElementById('_symbol_' + array['symbol']) == null) {
		        document.getElementById('positionTable').innerHTML += 
		        "<tr onclick=updateData(this); id='_id_" + array['symbol'] + "USDT' class='tokenElement'><td style='width: 15%;' id='_symbol_" + array['symbol']  + 
		        "'>" + array['symbol'] + "</td><td id='_amount_" + array['symbol'] + 
		        "USDT'>" + parseFloat(array['amount']).toFixed(4) + "</td><td id='_avg_" + array['symbol'] + "USDT'>" + parseFloat(array['avgPrice']).toFixed(8 - array['avgPrice'].split('.')[0].length > 0 ? 8 - array['avgPrice'].split('.')[0].length : 0) + 
			 	"</td><td id='_pl_" + array['symbol'] + "USDT'><span id='_pos_" + array['symbol'] + "USDT'>-.--</span> USD <span id='_ch_" + array['symbol'] + 
			 	"USDT'></span></td><td align='right' style='width:50px;'><input type='hidden' value='" + array['symbol'] + 
			 	"id='_symbol2'><button style='width:30px; padding: 3px;' id='close' name='" + array['symbol'] + 
			 	"'type='submit' align='center' class='btn btn-danger'>x</button></td></tr>";
			 }
			 else{
			 	if (array['avgPrice'] != null) {
				 	document.getElementById('_symbol_' + array['symbol']).innerText = array['symbol'];
				 	document.getElementById('_amount_' + array['symbol'] + "USDT").innerText = parseFloat(array['amount']).toFixed(4);
				 	document.getElementById('_avg_' + array['symbol'] + "USDT").innerText  = parseFloat(array['avgPrice']).toFixed(8 - array['avgPrice'].split('.')[0].length > 0 ? 8 - array['avgPrice'].split('.')[0].length : 0);
				 	array['amount'] < 0 ? $('#_amount_' + array['symbol'] + "USDT").css('color', '#DC3546') : $('#_amount_' + array['symbol'] + "USDT").css('color', '#25A842');
				}
				else
					document.getElementById('_id_' + array['symbol'] + 'USDT').remove();
			}
			array['amount'] < 0 ? $('#_amount_' + array['symbol'] + "USDT").css('color', '#DC3546') : $('#_amount_' + array['symbol'] + "USDT").css('color', '#25A842');
	    });
	});
}

function updateBalance(){
	$.getJSON('accountInfo.php', function(data) {
		document.getElementById('balance').innerText = data.balance;
		document.getElementById('margin').innerText = data.margin.toFixed(2);
	});

}

function sumPl(){
	var length = symbols.length;
	var count = 0;
	var openPl = 0;
	
	for (var pl of symbols) {
		if (pl.price != null){
			count++
			openPl += parseFloat(pl.price)
		}
	}
	document.getElementById('openPl').innerText = openPl.toFixed(2) + " USD";
	openPl < 0 ? $('#openPl').css('color', '#DC3546') : $('#openPl').css('color', '#25A842');
}
