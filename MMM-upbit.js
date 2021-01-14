Module.register("MMM-upbit", {
	defaults: {},
	
	start: function () {
		Log.log("Starting module: " + this.name);
		
		this.upbit_logo = new Image(85, 19);
		this.upbit_logo.src = "./modules/MMM-upbit/UPbit_Logo.png";
		
		this.formatData = {
			type: "trade",
			codes: Object.keys(this.config.codes)
		};
		
		Log.log(this.formatData);
		
		this.dom_coin_codes = {};
		
		for (let coin of Object.keys(this.config.codes)) {
			var currency = coin.split('-')[0];
			var code = coin.split('-')[1];
			
			var codeTdElements = [];
			
			var tableRow_coin = document.createElement('tr');
			
			var coin_name = document.createElement('td');
			coin_name.id = coin;
			coin_name.style.lineHeight = "0.2em";
			coin_name.innerHTML = code;
			tableRow_coin.appendChild(coin_name);
			
			var code_price = document.createElement('td');
			code_price.id = coin + "_price";
			codeTdElements.push(code_price);
			tableRow_coin.appendChild(code_price);
			
			var change_percent = document.createElement('td');
			change_percent.id = coin + '_changePercent';
			tableRow_coin.appendChild(change_percent);
			
			// 수량, 매수가를 입력했을 때
			if (this.config.codes[coin] !== null) {
				var code_amount = document.createElement('td');
				code_amount.id = coin + "_amount";
				code_amount.innerHTML = `${this.config.codes[coin]['amount'].toFixed(2)}<label>${code}</label>`;
				codeTdElements.push(code_amount);
				tableRow_coin.appendChild(code_amount);
				
				var total_Purchase = document.createElement('td');
				total_Purchase.id = coin + '_totalPurchase';
				codeTdElements.push(total_Purchase);
				tableRow_coin.appendChild(total_Purchase);

				var code_benefit = document.createElement('td');
				code_benefit.id = coin + "_benefit";
				codeTdElements.push(code_benefit);
				tableRow_coin.appendChild(code_benefit);
			}
			
			for (let elem of codeTdElements) {
				elem.className = "codeTdElement";
			}
			
			this.dom_coin_codes[coin] = tableRow_coin;
		}
		
	},
	
	getStyles: function () {
		return ["MMM-upbit.css"];
	},
	
	getDom: function() {
		var container = document.createElement("div");
		container.className = "upbit_container";
		
		container.append(this.upbit_logo);
		
		var tbody_coins = document.createElement('tbody');
		tbody_coins.id = 'tbody_coins'
		for (let node in this.dom_coin_codes){
			tbody_coins.appendChild(this.dom_coin_codes[node]);
		}
		
		container.append(tbody_coins);
		return container;
	},
	
	notificationReceived: function(notification, payload) {
		switch(notification){
			case "DOM_OBJECTS_CREATED":
				// this.updateDom();
				this.sendSocketNotification("WS_CONNECT", this.formatData);
				break;
		}
	},
	
	socketNotificationReceived: function(notification, payload) {
		switch(notification){
			case "WS_PRICE_INFO":
				/* 
				change_percent: 2.3009495982468953
				​
				change_price: 31500
				​
				symbol: "KRW-ETH"
				​
				trade_price: 1369000
				*/
				var targetSymbol = payload['symbol'];
				var targetSymbolCurrency = targetSymbol.split('-')[0]; // KRW, BTC, etc...
				
				var targetDomObject = this.dom_coin_codes[targetSymbol];
				// Log.log(targetDomObject);
				var target_price_elem = document.getElementById(targetSymbol + "_price");
				this.setColorByFluctuation(target_price_elem, payload['change_price']);
				target_price_elem.innerHTML = `${payload['trade_price']}<label>${targetSymbolCurrency}</label><br><label>${payload['change_price']}(${payload['change_percent'].toFixed(2)}%)</label>`;
				
				// 수량, 매수가를 입력했을 때
				if (this.config.codes[targetSymbol] !== null) {
					var target_benefit_elem = document.getElementById(targetSymbol + "_benefit");
					var total_purchase_elem = document.getElementById(targetSymbol + '_totalPurchase');
					// 현재가 - 매수가 * 수량
					var benefit = (payload['trade_price'] - this.config.codes[targetSymbol]['buy_In']) * this.config.codes[targetSymbol]['amount'].toFixed(0);
					// 총매수
					var total_Purchase = this.config.codes[targetSymbol]['amount'] * this.config.codes[targetSymbol]['buy_In'];
					total_purchase_elem.innerHTML = `${total_Purchase.toFixed(0)}<label>${targetSymbolCurrency}</label>`;
					// 이익 / 총매수 * 100 = 수익률
					var benefit_percent = (benefit / total_Purchase) * 100;
					var total_price = total_Purchase + benefit;
					this.setColorByFluctuation(target_benefit_elem, benefit_percent);
					target_benefit_elem.innerHTML = `${benefit}<label>${targetSymbolCurrency}</label>(${benefit_percent.toFixed(2)}%)<br><label>${total_price.toFixed(0)} ${targetSymbolCurrency}</label>`;
				}
				this.updateDom();
				break;
			case "DEBUG_LOG":
				Log.log("DEBUG: ", payload);
				break;
		}
	},
	
	// 등(빨간색) 락(파란색) 색깔 지정 함수
	setColorByFluctuation: function (elem, changed_val){
		if (changed_val > 0){
			// 전일 대비 상승
			elem.style.color = '#FF5733';
		} else if (changed_val < 0) {
			// 전일 대비 하락
			elem.style.color = '#3380FF';
		} else { 
			// 전일과 동일
			elem.style.color = ' white';
		}
	}
	
	
})